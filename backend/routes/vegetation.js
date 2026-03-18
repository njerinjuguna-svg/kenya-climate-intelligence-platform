const express = require('express');
const router = express.Router();
const { getAllVegetation, getVegetationByCounty } = require('../controllers/vegetationController');

router.get('/', getAllVegetation);
router.get('/:id', getVegetationByCounty);

module.exports = router;