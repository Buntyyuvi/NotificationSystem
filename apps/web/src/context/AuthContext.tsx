import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { authApi } from '../services/authApi';
import { getToken, setToken } from '../utils/token';
import { updateSocketToken } from '../config/socket';
import type { User } from '../types/user';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then(({ data }) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((value: string | null) => {
    setToken(value);
    setTokenState(value);
    updateSocketToken(value);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await authApi.login(email, password);
      persist(data.token);
      setUser(data.user);
    },
    [persist]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const { data } = await authApi.register(email, password);
      persist(data.token);
      setUser(data.user);
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null);
    setUser(null);
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
