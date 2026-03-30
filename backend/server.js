const express = require('express');
const cors = require('cors');
const pool = require('./db');
const countiesRoute = require('./routes/counties');
const climateRiskRoute = require('./routes/climateRisk');
const rainfallRoute = require('./routes/rainfall');
const vegetationRoute = require('./routes/vegetation');
const authRoute = require('./routes/auth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Kenya Climate Platform API is running!' });
});

app.use('/counties', countiesRoute);
app.use('/climate-risk', climateRiskRoute);
app.use('/rainfall', rainfallRoute);
app.use('/vegetation', vegetationRoute);
app.use('/auth', authRoute);


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

