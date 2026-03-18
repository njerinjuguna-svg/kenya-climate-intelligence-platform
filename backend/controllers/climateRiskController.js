const pool = require('../db');

// Get climate risk for all counties
const getAllClimateRisk = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.ogc_fid,
        c.adm1_name,
        c.area_sqkm,
        cr.drought_risk,
        cr.flood_risk,
        cr.vegetation_change,
        cr.rainfall_trend,
        cr.risk_score,
        cr.assessment_date
       FROM counties c
       LEFT JOIN climate_risk cr ON c.ogc_fid = cr.county_id
       ORDER BY c.adm1_name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching climate risk:', error);
    res.status(500).json({ error: 'Failed to fetch climate risk data' });
  }
};

// Get climate risk for one county
const getClimateRiskByCounty = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        c.ogc_fid,
        c.adm1_name,
        c.area_sqkm,
        cr.drought_risk,
        cr.flood_risk,
        cr.vegetation_change,
        cr.rainfall_trend,
        cr.risk_score,
        cr.assessment_date
       FROM counties c
       LEFT JOIN climate_risk cr ON c.ogc_fid = cr.county_id
       WHERE c.ogc_fid = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'County not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching climate risk:', error);
    res.status(500).json({ error: 'Failed to fetch climate risk data' });
  }
};

module.exports = { getAllClimateRisk, getClimateRiskByCounty };