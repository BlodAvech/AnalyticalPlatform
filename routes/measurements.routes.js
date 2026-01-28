const express = require('express');
const router = express.Router();
const controller = require('../controllers/measurements.controller')

router.get('/measurements' , controller.getMeasurement)
router.get('/metrics' , controller.getMetrics)

module.exports = router;	