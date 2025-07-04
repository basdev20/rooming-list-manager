const eventService = require('../services/eventService');

const handle = (fn) => (req, res) =>
  fn(req, res).catch(err =>
    res.status(500).json({ error: err.message || 'Internal server error' })
  );

module.exports = {
  getAll: handle(async (_, res) => {
    const events = await eventService.getAll();
    res.json({ status: 'success', data: events, count: events.length });
  }),

  getById: handle(async (req, res) => {
    const event = await eventService.getById(req.params.id);
    res.json({ status: 'success', data: event });
  }),

  create: handle(async (req, res) => {
    const event = await eventService.create(req.body);
    res.status(201).json({ status: 'success', message: 'Event created', data: event });
  }),

  update: handle(async (req, res) => {
    const event = await eventService.update(req.params.id, req.body);
    res.json({ status: 'success', message: 'Event updated', data: event });
  }),

  remove: handle(async (req, res) => {
    const event = await eventService.remove(req.params.id);
    res.json({ status: 'success', message: 'Event deleted', data: event });
  }),

  getRoomingLists: handle(async (req, res) => {
    const lists = await eventService.getRoomingLists(req.params.id);
    res.json({ status: 'success', data: lists });
  })
};
