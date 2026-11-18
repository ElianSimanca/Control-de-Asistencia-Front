import axios from 'axios';

const api = axios.create({
  baseURL: 'https://control-de-asistencia-cq18.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // AHORA USA sessionStorage
  const token = sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
