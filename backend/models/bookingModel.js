const { pool } = require('../config/database');

const getAllBookings = async () => {
  const query = `
    SELECT b.*, e."eventName"
    FROM bookings b
    LEFT JOIN events e ON b."eventId" = e."eventId"
    ORDER BY b."checkInDate"
  `;
  return (await pool.query(query)).rows;
};

const getBookingById = async (id) => {
  const query = `
    SELECT b.*, e."eventName"
    FROM bookings b
    LEFT JOIN events e ON b."eventId" = e."eventId"
    WHERE b."bookingId" = $1
  `;
  return (await pool.query(query, [id])).rows[0];
};

const createBooking = async (data) => {
  const { hotelId, eventId, guestName, guestPhoneNumber, checkInDate, checkOutDate } = data;
  const query = `
    INSERT INTO bookings ("hotelId", "eventId", "guestName", "guestPhoneNumber", "checkInDate", "checkOutDate")
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  return (await pool.query(query, [hotelId, eventId, guestName, guestPhoneNumber, checkInDate, checkOutDate])).rows[0];
};

const updateBooking = async (id, data) => {
  const { hotelId, eventId, guestName, guestPhoneNumber, checkInDate, checkOutDate } = data;
  const query = `
    UPDATE bookings SET 
      "hotelId" = COALESCE($2, "hotelId"),
      "eventId" = COALESCE($3, "eventId"),
      "guestName" = COALESCE($4, "guestName"),
      "guestPhoneNumber" = COALESCE($5, "guestPhoneNumber"),
      "checkInDate" = COALESCE($6, "checkInDate"),
      "checkOutDate" = COALESCE($7, "checkOutDate")
    WHERE "bookingId" = $1
    RETURNING *
  `;
  return (await pool.query(query, [id, hotelId, eventId, guestName, guestPhoneNumber, checkInDate, checkOutDate])).rows[0];
};

const deleteBooking = async (id) => {
  const query = 'DELETE FROM bookings WHERE "bookingId" = $1 RETURNING *';
  return (await pool.query(query, [id])).rows[0];
};

const getRoomingListsByBookingId = async (bookingId) => {
  const query = `
    SELECT rl.*, e."eventName", rlb."bookingId"
    FROM rooming_lists rl
    JOIN events e ON rl."eventId" = e."eventId"
    JOIN rooming_list_bookings rlb ON rl."roomingListId" = rlb."roomingListId"
    WHERE rlb."bookingId" = $1
    ORDER BY rl."cutOffDate"
  `;
  return (await pool.query(query, [bookingId])).rows;
};

const linkRoomingList = async (bookingId, roomingListId) => {
  const query = `
    INSERT INTO rooming_list_bookings ("roomingListId", "bookingId")
    VALUES ($1, $2)
  `;
  return pool.query(query, [roomingListId, bookingId]);
};

const unlinkRoomingList = async (bookingId, roomingListId) => {
  const query = `
    DELETE FROM rooming_list_bookings
    WHERE "bookingId" = $1 AND "roomingListId" = $2
    RETURNING *
  `;
  return (await pool.query(query, [bookingId, roomingListId])).rows[0];
};

const bookingExists = async (bookingId) => {
  const result = await pool.query('SELECT 1 FROM bookings WHERE "bookingId" = $1', [bookingId]);
  return result.rowCount > 0;
};

const roomingListExists = async (roomingListId) => {
  const result = await pool.query('SELECT 1 FROM rooming_lists WHERE "roomingListId" = $1', [roomingListId]);
  return result.rowCount > 0;
};

const isBookingLinked = async (bookingId, roomingListId) => {
  const result = await pool.query(
    'SELECT 1 FROM rooming_list_bookings WHERE "bookingId" = $1 AND "roomingListId" = $2',
    [bookingId, roomingListId]
  );
  return result.rowCount > 0;
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getRoomingListsByBookingId,
  linkRoomingList,
  unlinkRoomingList,
  bookingExists,
  roomingListExists,
  isBookingLinked
};
