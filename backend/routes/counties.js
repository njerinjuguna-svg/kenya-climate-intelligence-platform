const express = require('express');
const router = express.Router();
const { 
  getAllCounties, 
  getCountyById, 
  getCountiesGeoJSON,
  getNDVITrend,
  getRainfallTrend
} = require('../controllers/countiesController');

router.get('/geojson', getCountiesGeoJSON);
router.get('/:id/ndvi', getNDVITrend);
router.get('/:id/rainfall', getRainfallTrend);
router.get('/', getAllCounties);
router.get('/:id', getCountyById);

module.exports = router;