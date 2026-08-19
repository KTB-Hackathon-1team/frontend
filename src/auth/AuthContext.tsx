import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  loginRequest,
  logoutRequest,
  ParentUser,
  refreshAccessToken,
  signupRequest,
} from "./authApi";

type AuthContextValue = {
  user: ParentUser | null;
  isRestoring: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  signup: (loginId: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ParentUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;
    refreshAccessToken()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsRestoring(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isRestoring,
    async login(loginId, password) {
      const data = await loginRequest(loginId, password);
      setUser(data.user);
    },
    async signup(loginId, password, nickname) {
      const data = await signupRequest(loginId, password, nickname);
      setUser(data.user);
    },
    async logout() {
      try {
        await logoutRequest();
      } finally {
        setUser(null);
      }
    },
  }), [isRestoring, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
