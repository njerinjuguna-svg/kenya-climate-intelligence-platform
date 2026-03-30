const bcrypt = require('bcryptjs');
const pool = require('./db');
require('dotenv').config();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('Fides8660', 10);
  
  const result = await pool.query(
    `INSERT INTO users (username, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, role`,
    ['Admin', 'njerinjuguna943@gmail.com', hashedPassword, 'admin']
  );
  
  console.log('✅ Admin user created:', result.rows[0]);
  process.exit(0);
}

createAdmin().catch(console.error);