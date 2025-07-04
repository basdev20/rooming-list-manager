const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAll);
router.get('/:id', bookingController.getById);
router.post('/', bookingController.create);
router.put('/:id', bookingController.update);
router.delete('/:id', bookingController.remove);
router.get('/:id/rooming-lists', bookingController.getRoomingLists);
router.post('/:bookingId/rooming-lists/:roomingListId', bookingController.linkRoomingList);
router.delete('/:bookingId/rooming-lists/:roomingListId', bookingController.unlinkRoomingList);

module.exports = router;
