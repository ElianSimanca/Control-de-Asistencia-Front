import axios from 'axios';
import { addToast } from '@heroui/react';

const api = axios.create({
  baseURL: 'https://control-de-asistencia-cq18.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variables para controlar el aviso
let timeoutDespertar = null;
let avisoMostrado = false;

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Si la petición tarda más de 3.5 segundos en responder, asumimos que Render está dormido
  timeoutDespertar = setTimeout(() => {
    avisoMostrado = true;
    addToast({
      title: "Despertando el servidor...",
      description: "Render está tardando un poco. Esto puede tomar hasta 50 segundos la primera vez.",
      color: "warning",
      timeout: 10000, // El aviso dura 10 segundos en pantalla
    });
  }, 3500);

  return config;
});

api.interceptors.response.use(
  (response) => {
    // Si la petición fue exitosa, cancelamos el temporizador
    if (timeoutDespertar) clearTimeout(timeoutDespertar);
    
    // Si habíamos mostrado el aviso, mostramos uno de éxito
    if (avisoMostrado) {
      avisoMostrado = false;
      addToast({
        title: "¡Conectado!",
        description: "El servidor ha despertado y los datos están listos.",
        color: "success",
      });
    }
    
    return response;
  },
  (error) => {
    // Si hay un error, también cancelamos el temporizador
    if (timeoutDespertar) clearTimeout(timeoutDespertar);
    return Promise.reject(error);
  }
);

export default api;
