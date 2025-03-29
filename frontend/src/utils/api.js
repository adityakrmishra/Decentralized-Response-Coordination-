import axios from 'axios';
import { getAuthToken } from './auth';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://api.disaster-response.org/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchEmergencies = async (params = {}) => {
  try {
    const response = await apiClient.get('/emergencies', { params });
    return normalizeEmergencyData(response.data);
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch emergencies');
  }
};

export const submitReport = async (reportData) => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.post('/reports', reportData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Report submission failed');
  }
};

export const fetchSupplyChain = async (resourceId) => {
  try {
    const response = await apiClient.get(`/supply-chain/${resourceId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch supply data');
  }
};

export const getResources = async (filters = {}) => {
  try {
    const response = await apiClient.get('/resources', { 
      params: { ...filters, verified: true } 
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Resource fetch failed');
  }
};

export const getUserReports = async (userId) => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.get(`/users/${userId}/reports`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to load user reports');
  }
};

const normalizeEmergencyData = (data) => {
  return data.map(emergency => ({
    ...emergency,
    coordinates: [emergency.latitude, emergency.longitude],
    startDate: new Date(emergency.startTime),
    endDate: emergency.endTime ? new Date(emergency.endTime) : null
  }));
};

const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    const { status, data } = error.response;
    return new Error(data.message || `API Error: ${status}`);
  }
  return new Error(error.message || defaultMessage);
};
