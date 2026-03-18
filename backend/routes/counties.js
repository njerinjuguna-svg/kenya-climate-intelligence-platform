const express = require('express');
const router = express.Router();
const { getAllCounties, getCountyById, getCountiesGeoJSON } = require('../controllers/countiesController');

router.get('/geojson', getCountiesGeoJSON);
router.get('/', getAllCounties);
router.get('/:id', getCountyById);

module.exports = router;