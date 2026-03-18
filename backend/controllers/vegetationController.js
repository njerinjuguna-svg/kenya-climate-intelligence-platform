const pool = require('../db');

// Get vegetation data for all counties
const getAllVegetation = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.adm1_name,
        v.date,
        v.ndvi_value,
        v.vegetation_health
       FROM vegetation_index v
       JOIN counties c ON v.county_id = c.ogc_fid
       ORDER BY c.adm1_name, v.date`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vegetation data:', error);
    res.status(500).json({ error: 'Failed to fetch vegetation data' });
  }
};

// Get vegetation for one county
const getVegetationByCounty = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        c.adm1_name,
        v.date,
        v.ndvi_value,
        v.vegetation_health
       FROM vegetation_index v
       JOIN counties c ON v.county_id = c.ogc_fid
       WHERE v.county_id = $1
       ORDER BY v.date`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vegetation data:', error);
    res.status(500).json({ error: 'Failed to fetch vegetation data' });
  }
};

module.exports = { getAllVegetation, getVegetationByCounty };