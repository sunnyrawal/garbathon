// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 35000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error?.message ||
      err.message ||
      'An unexpected error occurred.';
    return Promise.reject({ ...err, userMessage: message });
  }
);

export const analyzeImage = async (imageFile, area) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (area) formData.append('area', area);
  const { data } = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const lookupWard = async (area) => {
  const { data } = await api.get('/wards', { params: { area } });
  return data;
};

export const lookupDepartment = async (issueType) => {
  const { data } = await api.get('/departments', { params: { issueType } });
  return data;
};

export const createComplaint = async (payload) => {
  const { data } = await api.post('/complaints', payload);
  return data;
};

export const getComplaint = async (ticketId) => {
  const { data } = await api.get(`/complaints/${ticketId}`);
  return data;
};

export const listComplaints = async () => {
  const { data } = await api.get('/complaints');
  return data;
};

export const askAssistant = async (question, ticketId = null) => {
  const { data } = await api.post('/assistant', { question, ticketId });
  return data;
};

export const healthCheck = async () => {
  const { data } = await api.get('/health');
  return data;
};

export default api;
