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

module.exports = { getAllCounties, getCountyById, getCountiesGeoJSON };