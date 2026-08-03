import axios from "axios";
import { useAuthStore } from "../store/auth.store";

let API_URL = import.meta.env.VITE_API_URL || "";
// Safeguard: remove trailing /api if the user accidentally included it in their .env
if (API_URL.endsWith('/api')) {
  API_URL = API_URL.slice(0, -4);
} else if (API_URL.endsWith('/api/')) {
  API_URL = API_URL.slice(0, -5);
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------- REQUEST ----------------

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- RESPONSE ----------------

let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // No response from server
    if (!error.response) {
      return Promise.reject(error);
    }

    // Don't refresh these endpoints
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/logout") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/firebase")
    ) {
      return Promise.reject(error);
    }

    // Token expired
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = refreshResponse.data.data.accessToken;

        useAuthStore.getState().setAccessToken(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        isRefreshing = false;

        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;

        // DON'T call logout here
        useAuthStore.setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;