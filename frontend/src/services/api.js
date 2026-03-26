import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

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

// NEW: Get NDVI trend for charts
export const getNDVITrend = async (countyId) => {
  const response = await axios.get(`${API_BASE_URL}/counties/${countyId}/ndvi`);
  return response.data;
};

// NEW: Get rainfall trend for charts
export const getRainfallTrend = async (countyId) => {
  const response = await axios.get(`${API_BASE_URL}/counties/${countyId}/rainfall`);
  return response.data;
};