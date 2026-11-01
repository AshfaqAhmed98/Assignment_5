"use client";

import { useEffect } from "react";

export type AuthToastMessage = {
  type: "success" | "error" | "info";
  message: string;
};

type AuthToastProps = {
  toast: AuthToastMessage | null;
  onDismiss: () => void;
};

export default function AuthToast({ toast, onDismiss }: AuthToastProps) {
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [toast, onDismiss]);

  if (!toast) {
    return null;
  }

  const styles = {
    success: "border-emerald-300/25 bg-emerald-950/95 text-emerald-100",
    error: "border-rose-300/25 bg-rose-950/95 text-rose-100",
    info: "border-cyan-300/25 bg-slate-950/95 text-cyan-100",
  }[toast.type];

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className={`fixed right-4 top-24 z-[100] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${styles}`}
    >
      <span className="flex-1 leading-5">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded px-1 text-current/70 transition hover:text-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        ×
      </button>
    </div>
  );
}
