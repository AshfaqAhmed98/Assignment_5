"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type AppTheme = "dark" | "light";

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
};

const storageKey = "eventmatrix.theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeSubscribers = new Set<() => void>();

function getThemeSnapshot(): AppTheme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerThemeSnapshot(): AppTheme {
  return "dark";
}

function subscribeToTheme(subscriber: () => void) {
  themeSubscribers.add(subscriber);
  return () => themeSubscribers.delete(subscriber);
}

function updateDocumentTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(storageKey, theme);
  themeSubscribers.forEach((subscriber) => subscriber());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    updateDocumentTheme(
      storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark",
    );
  }, []);

  const toggleTheme = useCallback(() => {
    updateDocumentTheme(getThemeSnapshot() === "dark" ? "light" : "dark");
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
}
