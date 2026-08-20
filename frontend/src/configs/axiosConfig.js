import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token_usuario') || localStorage.getItem('app-token');
    const usuario = JSON.parse(localStorage.getItem('dados_usuario') || localStorage.getItem('usuario') || 'null');
    const tokenUsuario = usuario?.token;
    const tokenFinal = token || tokenUsuario;

    if (tokenFinal) {
      config.headers.Authorization = `Bearer ${tokenFinal}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;