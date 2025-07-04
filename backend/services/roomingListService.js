const { pool } = require('../config/database');

const VALID_STATUSES = ['Active', 'Closed', 'Cancelled'];
const VALID_AGREEMENT_TYPES = ['leisure', 'staff', 'artist'];

async function fetchAllRoomingLists(status) {
  let query = `
    SELECT 
      rl."roomingListId",
      rl."eventId",
      rl."hotelId",
      rl."rfpName",
      rl."cutOffDate",
      rl.status,
      rl."agreement_type",
      rl.created_at,
      e."eventName",
      COUNT(rlb."bookingId") as "bookingCount"
    FROM rooming_lists rl
    LEFT JOIN events e ON rl."eventId" = e."eventId"
    LEFT JOIN rooming_list_bookings rlb ON rl."roomingListId" = rlb."roomingListId"
  `;

  const params = [];
  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid status filter: ${status}`);
    }
    query += ` WHERE rl.status = $1 `;
    params.push(status);
  }

  query += `
    GROUP BY rl."roomingListId", e."eventName"
    ORDER BY rl.created_at DESC
  `;

  const result = await pool.query(query, params);
  return result.rows;
}

async function fetchRoomingListById(id) {
  const query = `
    SELECT 
      rl.*,
      e."eventName"
    FROM rooming_lists rl
    LEFT JOIN events e ON rl."eventId" = e."eventId"
    WHERE rl."roomingListId" = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function fetchBookingsByRoomingListId(id) {
  const query = `
    SELECT 
      b."bookingId",
      b."hotelId",
      b."eventId",
      b."guestName",
      b."guestPhoneNumber",
      b."checkInDate",
      b."checkOutDate",
      b.created_at,
      e."eventName"
    FROM rooming_list_bookings rlb
    JOIN bookings b ON rlb."bookingId" = b."bookingId"
    LEFT JOIN events e ON b."eventId" = e."eventId"
    WHERE rlb."roomingListId" = $1
    ORDER BY b."checkInDate"
  `;

  const result = await pool.query(query, [id]);
  return result.rows;
}

async function createRoomingList(payload) {
  const {
    eventId,
    hotelId,
    rfpName,
    cutOffDate,
    status = 'Active',
    agreement_type,
  } = payload;

  if (!eventId || !hotelId || !rfpName || !cutOffDate || !agreement_type) {
    throw new Error('Missing required fields');
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status value: ${status}`);
  }

  if (!VALID_AGREEMENT_TYPES.includes(agreement_type)) {
    throw new Error(`Invalid agreement_type value: ${agreement_type}`);
  }

  const query = `
    INSERT INTO rooming_lists ("eventId", "hotelId", "rfpName", "cutOffDate", status, "agreement_type")
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [eventId, hotelId, rfpName, cutOffDate, status, agreement_type];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function updateRoomingList(id, payload) {
  const {
    eventId,
    hotelId,
    rfpName,
    cutOffDate,
    status,
    agreement_type,
  } = payload;

  if (status && !VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status value: ${status}`);
  }

  if (agreement_type && !VALID_AGREEMENT_TYPES.includes(agreement_type)) {
    throw new Error(`Invalid agreement_type value: ${agreement_type}`);
  }

  const query = `
    UPDATE rooming_lists
    SET "eventId" = COALESCE($2, "eventId"),
        "hotelId" = COALESCE($3, "hotelId"),
        "rfpName" = COALESCE($4, "rfpName"),
        "cutOffDate" = COALESCE($5, "cutOffDate"),
        status = COALESCE($6, status),
        "agreement_type" = COALESCE($7, "agreement_type")
    WHERE "roomingListId" = $1
    RETURNING *
  `;

  const values = [id, eventId, hotelId, rfpName, cutOffDate, status, agreement_type];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

async function deleteRoomingList(id) {
  const query = `
    DELETE FROM rooming_lists
    WHERE "roomingListId" = $1
    RETURNING *
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

module.exports = {
  fetchAllRoomingLists,
  fetchRoomingListById,
  fetchBookingsByRoomingListId,
  createRoomingList,
  updateRoomingList,
  deleteRoomingList
};
