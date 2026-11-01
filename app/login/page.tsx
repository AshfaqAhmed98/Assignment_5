"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";
import AuthToast, { type AuthToastMessage } from "@/components/auth-toast";

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [toast, setToast] = useState<AuthToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast({
      type: "success",
      message:
        "Login form validated. Authentication is not connected, so no account session was created.",
    });
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0b0b12] px-4 py-12 sm:px-6 lg:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 top-0 size-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 size-96 rounded-full bg-fuchsia-600/15 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#15151d]/90 shadow-[0_32px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[1fr_0.9fr]">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-violet-600/25 via-fuchsia-500/10 to-cyan-500/15 p-10 lg:flex xl:p-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
              <span className="size-1.5 rounded-full bg-cyan-300" />
              Good things happen together
            </span>
            <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Find your people.
              <span className="mt-2 block bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                Make an impact.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
              Discover local events, meet people who care, and turn shared
              ideas into meaningful action.
            </p>
          </div>
          <p className="text-sm text-white/45">
            Find a cause. Join a community. Make it happen.
          </p>
        </section>

        <section className="flex items-center justify-center px-5 py-9 sm:px-10 sm:py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold text-fuchsia-300">
                Welcome to EventMatrix
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Log in to find your next community event.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToast({
                  type: "info",
                  message: "Google sign-in is not connected yet.",
                })
              }
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
                <path
                  fill="#FFC107"
                  d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
                />
                <path
                  fill="#FF3D00"
                  d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
                />
                <path
                  fill="#4CAF50"
                  d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
                />
                <path
                  fill="#1976D2"
                  d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-white/35">
                or with email
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-white/85"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-fuchsia-400/70 focus:ring-4 focus:ring-fuchsia-400/10"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-white/85"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-16 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-fuchsia-400/70 focus:ring-4 focus:ring-fuchsia-400/10"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((visible) => !visible)}
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    aria-pressed={passwordVisible}
                    className="absolute inset-y-0 right-0 rounded-r-xl px-4 text-xs font-semibold text-white/55 transition hover:text-white focus-visible:outline-2 focus-visible:outline-fuchsia-300"
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="min-h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.25)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_30px_rgba(236,72,153,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
              >
                Log in
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-white/55">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-fuchsia-300 underline decoration-fuchsia-300/40 underline-offset-4 transition hover:text-cyan-200 hover:decoration-cyan-200"
              >
                Register
              </Link>
            </p>
          </div>
        </section>
      </div>
      <AuthToast toast={toast} onDismiss={dismissToast} />
    </main>
  );
}
