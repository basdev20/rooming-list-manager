const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/status', dataController.getStatus);
router.post('/insert', dataController.insert);
router.delete('/clear', dataController.clear);

module.exports = router;
