import axios from 'axios';

const api = axios.create({
  baseURL: 'https://control-de-asistencia-cq18.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;