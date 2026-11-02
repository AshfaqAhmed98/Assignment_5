"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

const storageKey = "eventmatrix.access-token";
const AuthContext = createContext<AuthContextValue | null>(null);

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(storageKey);
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string"
  );
}

function isAuthResponse(value: unknown): value is AuthResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;
  return typeof response.token === "string" && isAuthUser(response.user);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object") {
    const error = (body as Record<string, unknown>).error;
    if (error && typeof error === "object") {
      const message = (error as Record<string, unknown>).message;
      if (typeof message === "string") {
        return message;
      }
    }
  }

  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = window.sessionStorage.getItem(storageKey);

    if (!token) {
      window.setTimeout(() => {
        if (active) {
          setStatus("unauthenticated");
        }
      }, 0);
      return () => {
        active = false;
      };
    }

    async function restoreSession() {
      try {
        const response = await fetch("/backend/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await readJson(response);

        if (!response.ok) {
          if (response.status === 401) {
            window.sessionStorage.removeItem(storageKey);
            if (active) {
              setUser(null);
              setStatus("unauthenticated");
            }
            return;
          }

          throw new Error(getErrorMessage(body, "Unable to verify your session."));
        }

        if (
          !body ||
          typeof body !== "object" ||
          !isAuthUser((body as Record<string, unknown>).user)
        ) {
          throw new Error("The authentication server returned an invalid response.");
        }

        if (active) {
          setUser((body as { user: AuthUser }).user);
          setStatus("authenticated");
          setError(null);
        }
      } catch (sessionError) {
        if (active) {
          setError(
            sessionError instanceof Error
              ? sessionError.message
              : "Unable to verify your session.",
          );
          setStatus("error");
        }
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const authenticate = useCallback(
    async (
      endpoint: "login" | "register",
      payload: Record<string, string>,
    ) => {
      const response = await fetch(`/backend/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await readJson(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(body, "Authentication failed."));
      }

      if (!isAuthResponse(body)) {
        throw new Error("The authentication server returned an invalid response.");
      }

      window.sessionStorage.setItem(storageKey, body.token);
      setUser(body.user);
      setStatus("authenticated");
      setError(null);
    },
    [],
  );

  const login = useCallback(
    (email: string, password: string) =>
      authenticate("login", { email, password }),
    [authenticate],
  );
  const register = useCallback(
    (name: string, email: string, password: string) =>
      authenticate("register", { name, email, password }),
    [authenticate],
  );
  const logout = useCallback(() => {
    window.sessionStorage.removeItem(storageKey);
    setUser(null);
    setError(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, error, login, register, logout }),
    [user, status, error, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return auth;
}
