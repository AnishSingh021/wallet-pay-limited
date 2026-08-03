import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // important for sending/receiving cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the access token
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

// Add a response interceptor to handle token refresh and generic errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 401 Unauthorized and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token via our auth endpoint (which reads the HttpOnly cookie)
        // We use axios directly here to avoid interceptor loops
        const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        
        if (response.data.success && response.data.data.accessToken) {
          const newAccessToken = response.data.data.accessToken;
          // Update the store with the new token
          useAuthStore.getState().setAccessToken(newAccessToken);
          
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log the user out entirely
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
