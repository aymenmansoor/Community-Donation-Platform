import axios from 'axios';
export const API_BASE = (process.env.REACT_APP_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');
const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const imageUrl = image => image ? `${API_BASE}/uploads/${encodeURIComponent(image)}` : '/donation-fallback.svg';
export default api;
