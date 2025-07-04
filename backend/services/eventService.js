const eventModel = require('../models/eventModel');

const getAll = () => eventModel.getAllEvents();

const getById = async (id) => {
  const event = await eventModel.getEventById(id);
  if (!event) throw new Error('Event not found');
  return event;
};

const create = async (data) => {
  if (!data.eventName) throw new Error('Missing required field: eventName');
  return await eventModel.createEvent(data);
};

const update = async (id, data) => {
  const updated = await eventModel.updateEvent(id, data);
  if (!updated) throw new Error('Event not found');
  return updated;
};

const remove = async (id) => {
  const deleted = await eventModel.deleteEvent(id);
  if (!deleted) throw new Error('Event not found');
  return deleted;
};

const getRoomingLists = async (eventId) => {
  return await eventModel.getRoomingListsByEventId(eventId);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getRoomingLists
};
