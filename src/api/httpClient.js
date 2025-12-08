// src/api/httpClient.js
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: false,
});

// --- Request Interceptor: attach access token ---
http.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: handle 401 + token refresh ---
let isRefreshing = false;
let requestQueue = [];

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only refresh on 401 AND only once
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      // Queue requests while refresh is happening
      if (isRefreshing) {
        return new Promise((resolve) => {
          requestQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(http(original));
          });
        });
      }

      isRefreshing = true;

      try {
        // Attempt refresh token
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newAT, refreshToken: newRT } = res.data.data;
        setTokens(newAT, newRT);

        // Replay queued requests
        requestQueue.forEach((cb) => cb(newAT));
        requestQueue = [];
        isRefreshing = false;

        // Retry original request
        original.headers.Authorization = `Bearer ${newAT}`;
        return http(original);
      } catch (refreshErr) {
        isRefreshing = false;
        requestQueue = [];
        logout();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export { http };
