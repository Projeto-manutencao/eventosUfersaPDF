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
      if (window.location.pathname !== '/login' && window.location.pathname !== '/solicitar') {
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

  const login = async ({ email, password }) => {
    const response = await api.post('/auth/login/', { email, password });
    tokenStorage.setTokens(response.data);
    setUser(response.data.user);
    return response.data.user;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin' || user?.is_staff,
      login,
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
