import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Prioriza sessionStorage para permitir sessões independentes por aba do navegador
    const token = sessionStorage.getItem('token_usuario') || localStorage.getItem('token_usuario') || localStorage.getItem('app-token');
    const usuario = JSON.parse(sessionStorage.getItem('dados_usuario') || localStorage.getItem('dados_usuario') || localStorage.getItem('usuario') || 'null');
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