import axios from 'axios';

const api = axios.create({
  baseURL: (() => {
    const raw = (import.meta.env.VITE_API_URL || '').trim();
    if (!raw) return '/api';
    const clean = raw.replace(/\/+$/, '');
    return clean.startsWith('http://') || clean.startsWith('https://') ? `${clean}/api` : `https://${clean}/api`;
  })(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Correlation ID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Request Interceptor: Attach Correlation ID & Bearer Token
api.interceptors.request.use(
  (config) => {
    // Correlation ID
    if (!config.headers['X-Correlation-ID']) {
      config.headers['X-Correlation-ID'] = generateUUID();
    }

    // Access Token
    const token = localStorage.getItem('worksync_access_token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatic Refresh Token Handling & Retry
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('worksync_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('worksync_access_token');
        localStorage.removeItem('worksync_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post('/api/auth/refresh', { refreshToken });
        const newAccessToken = refreshResponse.data.data.accessToken;
        const newRefreshToken = refreshResponse.data.data.refreshToken;

        localStorage.setItem('worksync_access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('worksync_refresh_token', newRefreshToken);
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('worksync_access_token');
        localStorage.removeItem('worksync_refresh_token');
        localStorage.removeItem('worksync_user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;
