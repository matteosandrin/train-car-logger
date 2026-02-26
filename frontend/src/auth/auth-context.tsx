import React, { createContext, useCallback, useMemo, useState } from "react";
import {
  getToken,
  getStoredUser,
  clearSession,
  login as apiLogin,
  register as apiRegister,
  type AuthUser,
} from "./auth-service";
import { keys } from "../storage/local-storage";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = useCallback(async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const result = await apiRegister(username, password);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    localStorage.removeItem(keys.SEEN_SHARED_CARS_KEY);
    localStorage.removeItem(keys.SYNC_QUEUE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: !!token, login, register, logout }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
