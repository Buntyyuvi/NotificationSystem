import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  userId: string | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (userId: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  token: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const login = (newUserId: string, newToken: string) => {
    setUserId(newUserId);
    setToken(newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setUserId(null);
    setToken(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ userId, token, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
