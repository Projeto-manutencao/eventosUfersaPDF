import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const tokenStorage = {
  getAccess: () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  setTokens: ({ access, refresh }) => {
    if (access) localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const refresh = tokenStorage.getRefresh();

    if (status === 401 && refresh && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
        tokenStorage.setTokens({ access: response.data.access });
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        tokenStorage.clear();
        unauthorizedHandler?.();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401) {
      tokenStorage.clear();
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);

export default api;
