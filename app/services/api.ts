import { env } from "@/config/env";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { router } from 'expo-router';

const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attaches the bearer token when available
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: logs the user out on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sessao expirada. Redirecionando para o login.");
      return (async () => {
        try {
          await useAuthStore.getState().logout();
        } catch (e) {
          console.warn('Erro no logout automatico:', e);
        }
  try { router.replace('/(auth)/login'); } catch { /* fallback noop */ }
        throw error;
      })();
    }
    return Promise.reject(error);
  }
);

export default api;

