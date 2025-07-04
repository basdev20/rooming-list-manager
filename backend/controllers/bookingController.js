const bookingService = require('../services/bookingService');

const handle = (fn) => (req, res) =>
  fn(req, res).catch((err) =>
    res.status(400).json({ error: err.message || 'Internal server error' })
  );

module.exports = {
  getAll: handle(async (_, res) => {
    const bookings = await bookingService.getAll();
    res.json({ status: 'success', count: bookings.length, data: bookings });
  }),

  getById: handle(async (req, res) => {
    const booking = await bookingService.getById(req.params.id);
    res.json({ status: 'success', data: booking });
  }),

  create: handle(async (req, res) => {
    const booking = await bookingService.create(req.body);
    res.status(201).json({ status: 'success', message: 'Created', data: booking });
  }),

  update: handle(async (req, res) => {
    const updated = await bookingService.update(req.params.id, req.body);
    res.json({ status: 'success', message: 'Updated', data: updated });
  }),

  remove: handle(async (req, res) => {
    const deleted = await bookingService.remove(req.params.id);
    res.json({ status: 'success', message: 'Deleted', data: deleted });
  }),

  getRoomingLists: handle(async (req, res) => {
    const lists = await bookingService.getRoomingLists(req.params.id);
    res.json({ status: 'success', data: lists });
  }),

  linkRoomingList: handle(async (req, res) => {
    await bookingService.linkRoomingList(req.params.bookingId, req.params.roomingListId);
    res.json({ message: 'Linked successfully' });
  }),

  unlinkRoomingList: handle(async (req, res) => {
    await bookingService.unlinkRoomingList(req.params.bookingId, req.params.roomingListId);
    res.json({ message: 'Unlinked successfully' });
  })
};
