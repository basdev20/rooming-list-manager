const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);
router.post('/', eventController.create);
router.put('/:id', eventController.update);
router.delete('/:id', eventController.remove);
router.get('/:id/rooming-lists', eventController.getRoomingLists);

module.exports = router;
