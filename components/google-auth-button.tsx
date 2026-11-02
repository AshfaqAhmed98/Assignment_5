"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useRef, useState } from "react";

export default function GoogleAuthButton({
  action,
  disabled,
  onCredential,
  onError,
}: {
  action: "signin" | "signup";
  disabled?: boolean;
  onCredential: (credential: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(320);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const width = Math.floor(entry.contentRect.width);
        setButtonWidth(Math.min(400, Math.max(200, width - 14)));
      }
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  if (!clientId) {
    return (
      <p className="rounded-xl border border-amber-200/20 bg-amber-300/5 px-4 py-3 text-center text-xs leading-5 text-amber-100">
        Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in
        Frontend/.env.local.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`google-auth-glow mx-auto max-w-[400px] ${
        disabled ? "google-auth-glow-disabled" : ""
      }`}
    >
      <div className="relative z-10 flex justify-center">
        <GoogleLogin
          text={action === "signup" ? "signup_with" : "signin"}
          theme="filled_black"
          shape="pill"
          size="large"
          width={String(buttonWidth)}
          onSuccess={(response) => {
            if (!response.credential) {
              onError("Google did not return an ID token. Please try again.");
              return;
            }

            void onCredential(response.credential).catch((error: unknown) => {
              onError(
                error instanceof Error
                  ? error.message
                  : "Google sign-in failed. Please try again.",
              );
            });
          }}
          onError={() => onError("Google sign-in failed. Please try again.")}
        />
      </div>
    </div>
  );
}
