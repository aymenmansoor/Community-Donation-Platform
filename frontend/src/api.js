import axios from 'axios';
export const API_BASE = (process.env.REACT_APP_API_URL ?? `http://${window.location.hostname}:5000`).replace(/\/$/, '');
let csrfToken = '';
export const setCsrfToken = value => { csrfToken = value || ''; };
const api = axios.create({ baseURL: API_BASE, timeout: 15000, withCredentials: true });
// Old browser bearer credentials are retired; HttpOnly cookies carry sessions.
localStorage.removeItem('token');
api.interceptors.request.use(config => {
  if (csrfToken && !['get','head','options'].includes(config.method)) config.headers['X-CSRF-Token'] = csrfToken;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.endsWith('/login')) window.dispatchEvent(new Event('session-expired'));
  return Promise.reject(error);
});
export const imageUrl = image => image ? `${API_BASE}/uploads/${encodeURIComponent(image)}` : '/donation-fallback.svg';
export default api;
