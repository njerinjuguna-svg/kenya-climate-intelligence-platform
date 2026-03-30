import axios from 'axios';

// In development uses localhost
// In production uses the deployed Render URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const getCounties = async () => {
  const response = await axios.get(`${API_BASE_URL}/counties`);
  return response.data;
};

export const getClimateRisk = async () => {
  const response = await axios.get(`${API_BASE_URL}/climate-risk`);
  return response.data;
};

export const getRainfall = async (countyId) => {
  const response = await axios.get(`${API_BASE_URL}/rainfall/${countyId}`);
  return response.data;
};

export const getVegetation = async (countyId) => {
  const response = await axios.get(`${API_BASE_URL}/vegetation/${countyId}`);
  return response.data;
};

export const getNDVITrend = async (countyId) => {
  const response = await axios.get(`${API_BASE_URL}/counties/${countyId}/ndvi`);
  return response.data;
};

export const getRainfallTrend = async (countyId) => {
  const response = await axios.get(`${API_BASE_URL}/counties/${countyId}/rainfall`);
  return response.data;
};
