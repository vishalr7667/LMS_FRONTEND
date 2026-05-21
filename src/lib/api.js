import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// --- Token store (module-level, shared across all imports) ---
let _accessToken = null;
let _onAuthFailure = null; // callback when refresh fails (e.g. clear user state)

export function setAccessToken(token) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

/**
 * Register a callback that fires when token refresh fails (user is logged out).
 * AuthProvider uses this to clear React state.
 */
export function onAuthFailure(callback) {
  _onAuthFailure = callback;
}

// --- Axios instance ---
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// Handle 401 → attempt silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Update module-level token
        _accessToken = data.accessToken;

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        _accessToken = null;
        if (_onAuthFailure) _onAuthFailure();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
