const pool = require('../db');

// Get all counties
const getAllCounties = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ogc_fid, adm1_name, adm1_pcode, area_sqkm 
       FROM counties 
       ORDER BY adm1_name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching counties:', error);
    res.status(500).json({ error: 'Failed to fetch counties' });
  }
};

// Get a single county by id
const getCountyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT ogc_fid, adm1_name, adm1_pcode, area_sqkm 
       FROM counties 
       WHERE ogc_fid = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'County not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching county:', error);
    res.status(500).json({ error: 'Failed to fetch county' });
  }
};

// Get counties as GeoJSON for the map
const getCountiesGeoJSON = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(wkb_geometry)::json,
            'properties', json_build_object(
              'adm1_name', adm1_name,
              'adm1_pcode', adm1_pcode,
              'area_sqkm', area_sqkm
            )
          )
        )
      ) AS geojson
      FROM counties`
    );
    res.json(result.rows[0].geojson);
  } catch (error) {
    console.error('Error fetching GeoJSON:', error);
    res.status(500).json({ error: 'Failed to fetch GeoJSON' });
  }
};

// Get NDVI trend for a county (for charts)
const getNDVITrend = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        v.date,
        v.ndvi_value,
        v.vegetation_health
       FROM vegetation_index v
       WHERE v.county_id = $1
       ORDER BY v.date`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching NDVI trend:', error);
    res.status(500).json({ error: 'Failed to fetch NDVI trend' });
  }
};

// Get rainfall trend for a county (for charts)
const getRainfallTrend = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        r.date,
        r.rainfall_mm,
        r.data_source
       FROM rainfall_data r
       WHERE r.county_id = $1
       ORDER BY r.date`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rainfall trend:', error);
    res.status(500).json({ error: 'Failed to fetch rainfall trend' });
  }
};


// Get land cover data for map layer
const getLandCover = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.ogc_fid,
        c.adm1_name,
        l.year,
        l.forest_percent,
        l.cropland_percent,
        l.urban_percent,
        l.bare_land_percent
       FROM land_cover l
       JOIN counties c ON l.county_id = c.ogc_fid
       ORDER BY c.adm1_name, l.year`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching land cover:', error);
    res.status(500).json({ error: 'Failed to fetch land cover data' });
  }
};

module.exports = { 
  getAllCounties, 
  getCountyById, 
  getCountiesGeoJSON,
  getNDVITrend,
  getRainfallTrend,
  getLandCover
};