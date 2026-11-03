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
import { authClient } from "@/lib/auth-client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  retrySession: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    photoURL?: string,
    photoFile?: File,
  ) => Promise<void>;
  loginWithGoogle: (callbackURL?: string) => Promise<void>;
  logout: () => Promise<void>;
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
    typeof user.email === "string" &&
    (user.photoURL === undefined || typeof user.photoURL === "string")
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

    const message = (body as Record<string, unknown>).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

function getBetterAuthError(
  error: { message?: string } | null | undefined,
  fallback: string,
) {
  return new Error(error?.message || fallback);
}

async function exchangeSessionForApiToken() {
  const response = await fetch("/backend/api/auth/exchange", {
    method: "POST",
    credentials: "include",
  });
  const body = await readJson(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, "Unable to complete sign-in."));
  }

  if (!isAuthResponse(body)) {
    throw new Error("The authentication server returned an invalid response.");
  }

  window.sessionStorage.setItem(storageKey, body.token);
  return body.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [sessionRetry, setSessionRetry] = useState(0);

  const restoreSession = useCallback(async () => {
    const result = await authClient.getSession();
    if (result.error) {
      throw getBetterAuthError(result.error, "Unable to verify your session.");
    }

    if (!result.data?.user) {
      return null;
    }

    return exchangeSessionForApiToken();
  }, []);

  const retrySession = useCallback(() => {
    setSessionRetry((retry) => retry + 1);
  }, []);

  useEffect(() => {
    let active = true;
    let timer: number;

    async function checkSession() {
      try {
        const currentUser = await restoreSession();
        if (!active) {
          return;
        }

        if (!currentUser) {
          window.sessionStorage.removeItem(storageKey);
          setUser(null);
          setStatus("unauthenticated");
          setError(null);
          return;
        }

        setUser(currentUser);
        setStatus("authenticated");
        setError(null);
      } catch (sessionError: unknown) {
        if (!active) {
          return;
        }

        setError(
          sessionError instanceof Error
            ? sessionError.message
            : "Unable to verify your session.",
        );
        setStatus("error");
        timer = window.setTimeout(() => void checkSession(), 5000);
      }
    }

    timer = window.setTimeout(() => void checkSession(), 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [restoreSession, sessionRetry]);

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await authClient.signIn.email({
      email: normalizedEmail,
      password,
    });

    if (result.error) {
      const legacyResponse = await fetch("/backend/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const legacyBody = await readJson(legacyResponse);

      if (!legacyResponse.ok) {
        if (legacyResponse.status === 401) {
          throw getBetterAuthError(result.error, "Email or password is incorrect.");
        }

        throw new Error(
          getErrorMessage(legacyBody, "Unable to verify your account."),
        );
      }

      if (!isAuthResponse(legacyBody)) {
        throw new Error("The authentication server returned an invalid response.");
      }

      const migrated = await authClient.signUp.email({
        name: legacyBody.user.name,
        email: normalizedEmail,
        password,
        ...(legacyBody.user.photoURL
          ? { image: legacyBody.user.photoURL }
          : {}),
      });

      if (migrated.error) {
        if (
          migrated.error.code ===
          "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
        ) {
          const existingAccount = await authClient.signIn.email({
            email: normalizedEmail,
            password,
          });

          if (existingAccount.error) {
            throw new Error(
              "An account already exists for this email, but its password was not accepted. Use the password for that account.",
            );
          }
        } else {
          throw getBetterAuthError(
            migrated.error,
            "Unable to migrate your account to BetterAuth.",
          );
        }
      }
    }

    const authenticatedUser = await exchangeSessionForApiToken();
    setUser(authenticatedUser);
    setStatus("authenticated");
    setError(null);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      photoURL?: string,
      photoFile?: File,
    ) => {
      let imageURL = photoURL;
      if (photoFile) {
        const uploadResponse = await fetch("/backend/api/auth/profile-images", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": photoFile.type },
          body: photoFile,
        });
        const uploadBody = await readJson(uploadResponse);
        if (!uploadResponse.ok) {
          throw new Error(
            getErrorMessage(uploadBody, "Unable to upload your profile photo."),
          );
        }

        if (!uploadBody || typeof uploadBody !== "object") {
          throw new Error("The server returned an invalid profile photo response.");
        }

        const imageId = (uploadBody as Record<string, unknown>).id;
        if (typeof imageId !== "string" || !/^[a-f\d]{24}$/i.test(imageId)) {
          throw new Error("The server returned an invalid profile photo response.");
        }

        imageURL = `${window.location.origin}/backend/api/auth/profile-images/${imageId}`;
      }

      const result = await authClient.signUp.email({
        name,
        email: email.trim().toLowerCase(),
        password,
        ...(imageURL ? { image: imageURL } : {}),
      });

      if (result.error) {
        throw getBetterAuthError(result.error, "Unable to create your account.");
      }

      const authenticatedUser = await exchangeSessionForApiToken();
      setUser(authenticatedUser);
      setStatus("authenticated");
      setError(null);
    },
    [],
  );

  const loginWithGoogle = useCallback(async (callbackURL?: string) => {
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL:
        callbackURL?.startsWith("/") && !callbackURL.startsWith("//")
          ? `${window.location.origin}${callbackURL}`
          : `${window.location.origin}/events`,
    });

    if (result.error) {
      throw getBetterAuthError(result.error, "Google sign-in failed.");
    }
  }, []);

  const logout = useCallback(async () => {
    const result = await authClient.signOut();
    if (result.error) {
      throw getBetterAuthError(result.error, "Unable to log out.");
    }

    window.sessionStorage.removeItem(storageKey);
    setUser(null);
    setError(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      retrySession,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [
      user,
      status,
      error,
      retrySession,
      login,
      register,
      loginWithGoogle,
      logout,
    ],
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
