import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setUnauthorizedHandler, tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      if (!['/login', '/admin-login', '/eventos'].includes(window.location.pathname)) {
        window.location.assign('/login');
      }
    });
  }, [logout]);

  useEffect(() => {
    const loadUser = async () => {
      if (!tokenStorage.getAccess()) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me/');
        setUser(response.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [logout]);

  const saveSession = (data) => {
    tokenStorage.setTokens(data);
    setUser(data.user);
    return data.user;
  };

  const login = async ({ email, password }) => {
    const response = await api.post('/auth/login/', { email, password });
    return saveSession(response.data);
  };

  const adminLogin = async ({ email, password }) => {
    const response = await api.post('/auth/admin-login/', { email, password });
    return saveSession(response.data);
  };

  const register = async ({ nome, email, password }) => {
    const response = await api.post('/auth/register/', { nome, email, password });
    return saveSession(response.data);
  };

  const refreshUser = async () => {
    const response = await api.get('/auth/me/');
    setUser(response.data);
    return response.data;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin' || user?.is_staff,
      login,
      adminLogin,
      register,
      refreshUser,
      logout,
    }),
    [loading, user, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
