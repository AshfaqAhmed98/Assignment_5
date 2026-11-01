"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";
import AuthToast, { type AuthToastMessage } from "@/components/auth-toast";

type RegistrationForm = {
  name: string;
  email: string;
  photoURL: string;
  password: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegistrationForm>({
    name: "",
    email: "",
    photoURL: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [toast, setToast] = useState<AuthToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  function updateField(field: keyof RegistrationForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const emailInput = formElement.elements.namedItem("email");
    const photoUrlInput = formElement.elements.namedItem("photoURL");

    if (!form.name.trim()) {
      setToast({ type: "error", message: "Please enter your name." });
      return;
    }

    if (
      !(emailInput instanceof HTMLInputElement) ||
      !emailInput.validity.valid
    ) {
      setToast({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    if (
      !(photoUrlInput instanceof HTMLInputElement) ||
      !photoUrlInput.validity.valid
    ) {
      setToast({
        type: "error",
        message: "Please enter a valid photo URL starting with http:// or https://.",
      });
      return;
    }

    const passwordRequirements = [
      { valid: /[A-Z]/.test(form.password), label: "one uppercase letter" },
      { valid: /[a-z]/.test(form.password), label: "one lowercase letter" },
      { valid: form.password.length >= 6, label: "at least 6 characters" },
    ];
    const unmetRequirements = passwordRequirements
      .filter((requirement) => !requirement.valid)
      .map((requirement) => requirement.label);

    if (unmetRequirements.length > 0) {
      setToast({
        type: "error",
        message: `Password must include ${unmetRequirements.join(", ")}.`,
      });
      return;
    }

    setToast({
      type: "success",
      message:
        "Registration form validated. Authentication is not connected, so no account was created.",
    });
  }

  const passwordChecks = [
    { label: "One uppercase letter", valid: /[A-Z]/.test(form.password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(form.password) },
    { label: "At least 6 characters", valid: form.password.length >= 6 },
  ];

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0b0b12] px-4 py-10 sm:px-6 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 top-0 size-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 size-96 rounded-full bg-fuchsia-600/15 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <section className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#15151d]/90 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-9">
        <div className="mb-7">
          <p className="text-sm font-semibold text-fuchsia-300">
            Join EventMatrix
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Sign up to find and share community events.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-white/85"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Your name"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-fuchsia-400/70 focus:ring-4 focus:ring-fuchsia-400/10"
            />
          </div>

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
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-fuchsia-400/70 focus:ring-4 focus:ring-fuchsia-400/10"
            />
          </div>

          <div>
            <label
              htmlFor="photoURL"
              className="mb-2 block text-sm font-semibold text-white/85"
            >
              Profile photo URL
            </label>
            <input
              id="photoURL"
              name="photoURL"
              type="url"
              autoComplete="url"
              required
              value={form.photoURL}
              onChange={(event) => updateField("photoURL", event.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-fuchsia-400/70 focus:ring-4 focus:ring-fuchsia-400/10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-white/85"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={passwordVisible ? "text" : "password"}
                autoComplete="new-password"
                required
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Create a password"
                aria-describedby="password-requirements"
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
            <ul
              id="password-requirements"
              className="mt-3 grid gap-1.5 text-xs sm:grid-cols-3"
              aria-label="Password requirements"
            >
              {passwordChecks.map((requirement) => (
                <li
                  key={requirement.label}
                  className={
                    requirement.valid ? "text-emerald-300" : "text-white/45"
                  }
                >
                  <span aria-hidden="true">
                    {requirement.valid ? "✓ " : "• "}
                  </span>
                  {requirement.label}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            className="min-h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.25)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_30px_rgba(236,72,153,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/55">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-fuchsia-300 underline decoration-fuchsia-300/40 underline-offset-4 transition hover:text-cyan-200 hover:decoration-cyan-200"
          >
            Log in
          </Link>
        </p>
      </section>

      <AuthToast toast={toast} onDismiss={dismissToast} />
    </main>
  );
}
