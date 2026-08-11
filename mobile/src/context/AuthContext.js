import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { saveToken, readToken, clearToken } from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

/**
 * Same contract as the web client's AuthContext, but backed by SecureStore
 * instead of localStorage, so every read is asynchronous.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Confirm a stored token still refers to a live account before trusting it.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await readToken();
        if (!token) return;
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data.user);
      } catch {
        await clearToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const persist = useCallback(async ({ user: nextUser, token }) => {
    await saveToken(token);
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

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
