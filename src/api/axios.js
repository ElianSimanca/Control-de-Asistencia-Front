import axios from 'axios';

const api = axios.create({
  baseURL: 'https://control-de-asistencia-cq18.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo de Sesión Expirada (401)
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('token');
      // Redirigir al login si el token expira
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
