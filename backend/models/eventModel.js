const { pool } = require('../config/database');

const getAllEvents = async () => {
  const query = `
    SELECT 
      e.*,
      COUNT(DISTINCT rl."roomingListId") as "roomingListCount",
      COUNT(DISTINCT b."bookingId") as "bookingCount"
    FROM events e
    LEFT JOIN rooming_lists rl ON e."eventId" = rl."eventId"
    LEFT JOIN bookings b ON e."eventId" = b."eventId"
    GROUP BY e."eventId"
    ORDER BY e.created_at DESC
  `;
  return (await pool.query(query)).rows;
};

const getEventById = async (id) => {
  const result = await pool.query('SELECT * FROM events WHERE "eventId" = $1', [id]);
  return result.rows[0];
};

const createEvent = async ({ eventName, description }) => {
  const query = `
    INSERT INTO events ("eventName", description)
    VALUES ($1, $2)
    RETURNING *
  `;
  return (await pool.query(query, [eventName, description])).rows[0];
};

const updateEvent = async (id, { eventName, description }) => {
  const query = `
    UPDATE events 
    SET "eventName" = COALESCE($2, "eventName"),
        description = COALESCE($3, description)
    WHERE "eventId" = $1
    RETURNING *
  `;
  return (await pool.query(query, [id, eventName, description])).rows[0];
};

const deleteEvent = async (id) => {
  const query = 'DELETE FROM events WHERE "eventId" = $1 RETURNING *';
  return (await pool.query(query, [id])).rows[0];
};

const getRoomingListsByEventId = async (eventId) => {
  const query = `
    SELECT rl.*, e."eventName"
    FROM rooming_lists rl
    JOIN events e ON rl."eventId" = e."eventId"
    WHERE rl."eventId" = $1
    ORDER BY rl."cutOffDate"
  `;
  return (await pool.query(query, [eventId])).rows;
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getRoomingListsByEventId
};
