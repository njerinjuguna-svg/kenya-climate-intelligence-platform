const pool = require('../db');

// Get rainfall data for all counties
const getAllRainfall = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.adm1_name,
        r.date,
        r.rainfall_mm,
        r.data_source
       FROM rainfall_data r
       JOIN counties c ON r.county_id = c.ogc_fid
       ORDER BY c.adm1_name, r.date`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rainfall data:', error);
    res.status(500).json({ error: 'Failed to fetch rainfall data' });
  }
};

// Get rainfall for one county
const getRainfallByCounty = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        c.adm1_name,
        r.date,
        r.rainfall_mm,
        r.data_source
       FROM rainfall_data r
       JOIN counties c ON r.county_id = c.ogc_fid
       WHERE r.county_id = $1
       ORDER BY r.date`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rainfall data:', error);
    res.status(500).json({ error: 'Failed to fetch rainfall data' });
  }
};

module.exports = { getAllRainfall, getRainfallByCounty };