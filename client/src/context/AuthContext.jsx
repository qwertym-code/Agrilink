import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { TOKEN_KEY } from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

/** Where a user belongs once signed in. */
export const dashboardPath = (role) => (role === 'retailer' ? '/retailer' : '/consumer');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, confirm any stored token still refers to a live account.
  // A token can be expired or belong to a deleted user, so trusting cached
  // data would show a signed-in UI for a dead session.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const persist = useCallback(({ user: nextUser, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const login = useCallback(async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    return persist(data);
  }, [persist]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return persist(data);
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
