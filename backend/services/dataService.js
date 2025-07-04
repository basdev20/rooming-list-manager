const { pool, clearAllData } = require('../config/database');
const { readJSON } = require('../utils/fileUtil');

const getStatus = async () => {
  const [bookings, roomingLists, events, roomingListBookings] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM bookings'),
    pool.query('SELECT COUNT(*) FROM rooming_lists'),
    pool.query('SELECT COUNT(*) FROM events'),
    pool.query('SELECT COUNT(*) FROM rooming_list_bookings')
  ]);

  return {
    bookings: parseInt(bookings.rows[0].count),
    roomingLists: parseInt(roomingLists.rows[0].count),
    events: parseInt(events.rows[0].count),
    roomingListBookings: parseInt(roomingListBookings.rows[0].count)
  };
};

const insertData = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await clearAllData();

    const roomingListsData = readJSON('rooming-lists.json');
    const bookingsData = readJSON('bookings.json');
    const roomingListBookingsData = readJSON('rooming-list-bookings.json');

    const uniqueEvents = [...new Set(bookingsData.map(b => b.eventId))];
    for (const eventId of uniqueEvents) {
      await client.query(`
        INSERT INTO events ("eventId", "eventName") 
        VALUES ($1, $2) ON CONFLICT ("eventId") DO NOTHING
      `, [eventId, `Event ${eventId}`]);
    }

    for (const booking of bookingsData) {
      await client.query(`
        INSERT INTO bookings 
        ("bookingId", "hotelId", "eventId", "guestName", "guestPhoneNumber", "checkInDate", "checkOutDate")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        booking.bookingId, booking.hotelId, booking.eventId,
        booking.guestName, booking.guestPhoneNumber,
        booking.checkInDate, booking.checkOutDate
      ]);
    }

    for (const roomingList of roomingListsData) {
      await client.query(`
        INSERT INTO rooming_lists 
        ("roomingListId", "eventId", "hotelId", "rfpName", "cutOffDate", "status", "agreement_type")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        roomingList.roomingListId, roomingList.eventId, roomingList.hotelId,
        roomingList.rfpName, roomingList.cutOffDate,
        roomingList.status || 'Active', roomingList.agreement_type
      ]);
    }

    for (const rel of roomingListBookingsData) {
      await client.query(`
        INSERT INTO rooming_list_bookings ("roomingListId", "bookingId")
        VALUES ($1, $2)
      `, [rel.roomingListId, rel.bookingId]);
    }

    await client.query('COMMIT');
    return {
      events: uniqueEvents.length,
      bookings: bookingsData.length,
      roomingLists: roomingListsData.length,
      roomingListBookings: roomingListBookingsData.length
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const clearData = async () => {
  await clearAllData();
};

module.exports = {
  getStatus,
  insertData,
  clearData
};
