const roomingListService = require('../services/roomingListService');

const getAllRoomingLists = async (req, res) => {
  try {
    const data = await roomingListService.fetchAllRoomingLists();
    res.json({ status: 'success', data, count: data.length });
  } catch (error) {
    console.error('❌ Error fetching rooming lists:', error);
    res.status(500).json({ error: 'Failed to fetch rooming lists' });
  }
};

const getRoomingListById = async (req, res) => {
  try {
    const data = await roomingListService.fetchRoomingListById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Rooming list not found' });
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('❌ Error fetching rooming list:', error);
    res.status(500).json({ error: 'Failed to fetch rooming list' });
  }
};

const getRoomingListBookings = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await roomingListService.fetchBookingsByRoomingListId(id);
    res.json({ status: 'success', data, count: data.length, roomingListId: parseInt(id) });
  } catch (error) {
    console.error('❌ Error fetching bookings for rooming list:', error);
    res.status(500).json({ error: 'Failed to fetch bookings for rooming list' });
  }
};

const createRoomingList = async (req, res) => {
  try {
    const payload = req.body;
    const data = await roomingListService.createRoomingList(payload);
    res.status(201).json({ status: 'success', message: 'Rooming list created successfully', data });
  } catch (error) {
    console.error('❌ Error creating rooming list:', error);
    res.status(500).json({ error: 'Failed to create rooming list' });
  }
};

const updateRoomingList = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const data = await roomingListService.updateRoomingList(id, payload);
    if (!data) return res.status(404).json({ error: 'Rooming list not found' });
    res.json({ status: 'success', message: 'Rooming list updated successfully', data });
  } catch (error) {
    console.error('❌ Error updating rooming list:', error);
    res.status(500).json({ error: 'Failed to update rooming list' });
  }
};

const deleteRoomingList = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await roomingListService.deleteRoomingList(id);
    if (!data) return res.status(404).json({ error: 'Rooming list not found' });
    res.json({ status: 'success', message: 'Rooming list deleted successfully', data });
  } catch (error) {
    console.error('❌ Error deleting rooming list:', error);
    res.status(500).json({ error: 'Failed to delete rooming list' });
  }
};

module.exports = {
  getAllRoomingLists,
  getRoomingListById,
  getRoomingListBookings,
  createRoomingList,
  updateRoomingList,
  deleteRoomingList
};
