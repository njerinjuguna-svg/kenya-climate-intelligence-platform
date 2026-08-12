require('dotenv').config();
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PORT:', process.env.DB_PORT);
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3005',
    'https://kenya-climate-intelligence-platform-henna.vercel.app',
    'https://kenya-climate-intelligence-platform-v6ur-1gj8hum54.vercel.app',
  ],
  credentials: true
}));

app.use(express.json());

const countiesRoute = require('./routes/counties');
const climateRiskRoute = require('./routes/climateRisk');
const rainfallRoute = require('./routes/rainfall');
const vegetationRoute = require('./routes/vegetation');
const authRoute = require('./routes/auth');

app.get('/', (req, res) => {
  res.json({ message: 'Kenya Climate Platform API is running!' });
});

app.use('/counties', countiesRoute);
app.use('/climate-risk', climateRiskRoute);
app.use('/rainfall', rainfallRoute);
app.use('/vegetation', vegetationRoute);
app.use('/auth', authRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});