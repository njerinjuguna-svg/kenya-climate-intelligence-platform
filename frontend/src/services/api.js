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