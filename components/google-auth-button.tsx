"use client";

import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

export default function GoogleAuthButton({
  action,
  disabled,
  onClick,
  onError,
}: {
  action: "signin" | "signup";
  disabled?: boolean;
  onClick: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const { theme } = useTheme();
  const [isStarting, setIsStarting] = useState(false);

  async function handleClick() {
    setIsStarting(true);
    try {
      await onClick();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Google sign-in failed. Please try again.",
      );
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div
      className={`google-auth-glow ${
        disabled || isStarting ? "google-auth-glow-disabled" : ""
      }`}
    >
      <div className="google-auth-glow-inner">
        <button
          type="button"
          disabled={disabled || isStarting}
          onClick={() => void handleClick()}
          className={`google-auth-button ${
            theme === "light"
              ? "google-auth-button-light"
              : "google-auth-button-dark"
          }`}
        >
          <span
            aria-hidden="true"
            className="bg-gradient-to-br from-blue-500 via-emerald-500 to-amber-500 bg-clip-text text-lg font-black text-transparent"
          >
            G
          </span>
          {isStarting
            ? "Connecting to Google…"
            : action === "signup"
              ? "Sign up with Google"
              : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
