const express = require('express');
const router = express.Router();
const { getAllClimateRisk, getClimateRiskByCounty } = require('../controllers/climateRiskController');

router.get('/', getAllClimateRisk);
router.get('/:id', getClimateRiskByCounty);

module.exports = router;