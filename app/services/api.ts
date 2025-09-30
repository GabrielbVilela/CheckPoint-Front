import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// ATENÇÃO: SUBSTITUA PELO IP REAL DA SUA MÁQUINA + PORTA DO BACKEND
const API_URL = 'http://192.168.1.10:8000'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Adiciona o Token de Autenticação
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    // Adiciona o cabeçalho 'Authorization: Bearer <token>'
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta (Opcional, mas útil para deslogar em caso de 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber um 401 Unauthorized, forçamos o logout
    if (error.response?.status === 401) {
      console.warn("Sessão expirada. Redirecionando para o login.");
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;