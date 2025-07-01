// src/services/api.ts

import axios from "axios";

// Usar variável de ambiente para baseURL, para facilitar deploy e ambientes distintos
const baseURL = import.meta.env.VITE_API_URL || "https://authapi.healthsafetytech.com";

// Cria uma instância do axios já configurada
const api = axios.create({
  baseURL,
});

// Interceptor: adiciona o Authorization com Bearer token se houver token no localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
