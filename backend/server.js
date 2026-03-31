const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

// Allow requests from your Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:3005',
    'kenya-climate-intelligence-platform-v6ur-rmas0s83p.vercel.app',
    // Add your actual Vercel URL here
  ],
  credentials: true
}));

app.use(express.json());

// Routes
const countiesRoute = require('./routes/counties');
const climateRiskRoute = require('./routes/climateRisk');
const rainfallRoute = require('./routes/rainfall');
const vegetationRoute = require('./routes/vegetation');
const authRoute = require('./routes/auth');

app.get('/', (req, res) => {
  res.json({ 
    message: 'Kenya Climate Platform API is running!',
    version: '1.0.0',
    endpoints: [
      'GET /counties',
      'GET /counties/geojson',
      'GET /climate-risk',
      'GET /rainfall',
      'GET /vegetation',
      'POST /auth/login',
      'POST /auth/register'
    ]
  });
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