'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api, {
  API_URL,
  setAccessToken as setApiToken,
  onAuthFailure,
} from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep the module-level token in sync with React state
  const updateToken = (token) => {
    setAccessToken(token);
    setApiToken(token);
  };

  useEffect(() => {
    onAuthFailure(() => {
      setUser(null);
      setAccessToken(null);
      setApiToken(null);
    });
  }, []);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add absolute timeout to prevent hanging on stale connections
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { 
          withCredentials: true,
          timeout: 10000 
        });
        updateToken(data.accessToken);

        const meRes = await api.get('/auth/me', { timeout: 8000 });
        setUser(meRes.data.user);
      } catch (error) {
        // Only log if it's not a standard 'Not Authorized' or 'Token Expired' error
        if (error.response?.status !== 401) {
          console.error('Initial checkAuth failed/timed out:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    updateToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    updateToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    updateToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, api, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
