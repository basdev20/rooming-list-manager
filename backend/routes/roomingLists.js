const express = require('express');
const roomingListController = require('../controllers/roomingListController');

const router = express.Router();

router.get('/', roomingListController.getAllRoomingLists);
router.get('/:id', roomingListController.getRoomingListById);
router.get('/:id/bookings', roomingListController.getRoomingListBookings);
router.post('/', roomingListController.createRoomingList);
router.put('/:id', roomingListController.updateRoomingList);
router.delete('/:id', roomingListController.deleteRoomingList);

module.exports = router;
