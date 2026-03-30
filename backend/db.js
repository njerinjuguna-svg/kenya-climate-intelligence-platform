const { Pool } = require('pg');
const { create } = require('domain');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }  
    : false
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to database!');
  }
});

module.exports = pool;