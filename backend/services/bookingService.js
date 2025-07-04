const bookingModel = require('../models/bookingModel');

const getAll = () => bookingModel.getAllBookings();

const getById = async (id) => {
  const booking = await bookingModel.getBookingById(id);
  if (!booking) throw new Error('Booking not found');
  return booking;
};

const create = async (data) => {
  return await bookingModel.createBooking(data);
};

const update = async (id, data) => {
  const updated = await bookingModel.updateBooking(id, data);
  if (!updated) throw new Error('Booking not found');
  return updated;
};

const remove = async (id) => {
  const deleted = await bookingModel.deleteBooking(id);
  if (!deleted) throw new Error('Booking not found');
  return deleted;
};

const getRoomingLists = async (id) => {
  return await bookingModel.getRoomingListsByBookingId(id);
};

const linkRoomingList = async (bookingId, roomingListId) => {
  if (!(await bookingModel.bookingExists(bookingId))) throw new Error('Booking not found');
  if (!(await bookingModel.roomingListExists(roomingListId))) throw new Error('Rooming list not found');
  if (await bookingModel.isBookingLinked(bookingId, roomingListId)) throw new Error('Already linked');
  await bookingModel.linkRoomingList(bookingId, roomingListId);
};

const unlinkRoomingList = async (bookingId, roomingListId) => {
  const unlinked = await bookingModel.unlinkRoomingList(bookingId, roomingListId);
  if (!unlinked) throw new Error('Link not found');
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getRoomingLists,
  linkRoomingList,
  unlinkRoomingList
};
