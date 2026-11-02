"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";
import AuthToast, { type AuthToastMessage } from "@/components/auth-toast";
import GoogleAuthButton from "@/components/google-auth-button";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<AuthToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);

    try {
      await login(
        String(formData.get("email") ?? ""),
        String(formData.get("password") ?? ""),
      );
      const callbackURL = new URLSearchParams(window.location.search).get(
        "callbackURL",
      );
      const destination =
        callbackURL?.startsWith("/") && !callbackURL.startsWith("//")
          ? callbackURL
          : "/events";
      router.replace(destination);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to log in.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn(credential: string) {
    setIsSubmitting(true);
    setToast(null);

    try {
      await loginWithGoogle(credential);
      const callbackURL = new URLSearchParams(window.location.search).get(
        "callbackURL",
      );
      const destination =
        callbackURL?.startsWith("/") && !callbackURL.startsWith("//")
          ? callbackURL
          : "/events";
      router.replace(destination);
    } finally {
      setIsSubmitting(false);
    }
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

            <GoogleAuthButton
              action="signin"
              disabled={isSubmitting}
              onCredential={handleGoogleSignIn}
              onError={(message) =>
                setToast({ type: "error", message })
              }
            />

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
                disabled={isSubmitting}
                className="min-h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.25)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_30px_rgba(236,72,153,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
              >
                {isSubmitting ? "Logging in…" : "Log in"}
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
