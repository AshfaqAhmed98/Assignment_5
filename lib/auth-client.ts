"use client";

import { createAuthClient } from "better-auth/react";

export function getBackendURL() {
  const configuredURL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const backendURL =
    configuredURL ||
    (typeof window === "undefined"
      ? "http://localhost:3001"
      : `${window.location.protocol}//${window.location.hostname}:3001`);

  return backendURL.replace(/\/$/, "");
}

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined" ? getBackendURL() : window.location.origin,
  basePath: "/api/better-auth",
  fetchOptions: {
    credentials: "include",
  },
});
