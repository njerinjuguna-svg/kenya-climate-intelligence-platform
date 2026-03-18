const express = require('express');
const router = express.Router();
const { getAllRainfall, getRainfallByCounty } = require('../controllers/rainfallController');

router.get('/', getAllRainfall);
router.get('/:id', getRainfallByCounty);

module.exports = router;