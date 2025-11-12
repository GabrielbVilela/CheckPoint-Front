import axios, { AxiosInstance } from "axios";
import { getEnvConfig } from "src/constants/env";
import { useAuthStore } from "src/store/authStore";

/**
 * Cria um cliente Axios configurado em runtime. Evita usar valores avaliados
 * no momento do import (que podem ser undefined em alguns ambientes).
 */
export const getApiClient = (): AxiosInstance => {
  const { apiUrl } = getEnvConfig();

  const client = axios.create({
    baseURL: apiUrl,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor: attaches the bearer token when available
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token && config && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: logs the user out on 401 responses
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("Sessao expirada. Redirecionando para o login.");
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export default getApiClient;
