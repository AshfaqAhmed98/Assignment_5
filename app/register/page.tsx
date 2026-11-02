"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import AuthToast, { type AuthToastMessage } from "@/components/auth-toast";
import GoogleAuthButton from "@/components/google-auth-button";
import { useAuth } from "@/lib/auth";

type RegistrationForm = {
  name: string;
  email: string;
  photoURL: string;
  password: string;
};

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<RegistrationForm>({
    name: "",
    email: "",
    photoURL: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [photoMode, setPhotoMode] = useState<"url" | "upload">("url");
  const [uploadedPhoto, setUploadedPhoto] = useState("");
  const [photoFileName, setPhotoFileName] = useState("");
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<AuthToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  async function handleGoogleSignUp(credential: string) {
    setIsSubmitting(true);
    setToast(null);

    try {
      await loginWithGoogle(credential);
      router.replace("/events");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePhotoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    const hasSupportedExtension = /\.(jpe?g|png)$/i.test(file.name);
    const hasSupportedType = ["image/jpeg", "image/png"].includes(file.type);

    if (!hasSupportedExtension || !hasSupportedType) {
      setToast({ type: "error", message: "Choose a JPG or PNG image." });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: "error", message: "Profile photos must be 2 MB or smaller." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setToast({ type: "error", message: "Unable to read that image file." });
        return;
      }

      setUploadedPhoto(reader.result);
      setPhotoFileName(file.name);
      setForm((current) => ({ ...current, photoURL: "" }));
      setPhotoMode("upload");
      setToast(null);
    };
    reader.onerror = () => {
      setToast({ type: "error", message: "Unable to read that image file." });
    };
    reader.readAsDataURL(file);
  }

  function updateField(field: keyof RegistrationForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    if (photoMode === "url" && (
      !(photoUrlInput instanceof HTMLInputElement) ||
      !photoUrlInput.validity.valid
    )) {
      setToast({
        type: "error",
        message: "Please enter a valid photo URL starting with http:// or https://.",
      });
      return;
    }

    if (photoMode === "upload" && !uploadedPhoto) {
      setToast({ type: "error", message: "Choose a JPG or PNG profile photo." });
      return;
    }

    const passwordRequirements = [
      { valid: form.password.length >= 8, label: "at least 8 characters" },
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

    setIsSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      setToast({
        type: "success",
        message:
          "Account created. Profile photos are preview-only and are not saved yet.",
      });
      router.replace("/events");
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to create your account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordChecks = [
    { label: "At least 8 characters", valid: form.password.length >= 8 },
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
          <p className="mt-2 text-xs leading-5 text-amber-100/75">
            Profile photo selection is a preview and is not saved to your
            account yet.
          </p>
        </div>

        <GoogleAuthButton
          action="signup"
          disabled={isSubmitting}
          onCredential={handleGoogleSignUp}
          onError={(message) => setToast({ type: "error", message })}
        />
        <div className="my-5 flex items-center gap-4">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-white/35">
            or with email
          </span>
          <span className="h-px flex-1 bg-white/10" />
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
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="photoURL"
                className="text-sm font-semibold text-white/85"
              >
                Profile photo
              </label>
              <span className="text-xs text-white/45">JPG or PNG</span>
            </div>
            <div
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsPhotoMenuOpen(false);
                }
              }}
            >
              <input
                id="photoURL"
                name="photoURL"
                type="url"
                autoComplete="url"
                required={photoMode === "url"}
                value={form.photoURL}
                onChange={(event) => {
                  updateField("photoURL", event.target.value);
                  setUploadedPhoto("");
                  setPhotoFileName("");
                  setPhotoMode("url");
                }}
                placeholder="https://example.com/photo.jpg"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-fuchsia-400/70 focus:ring-4 focus:ring-fuchsia-400/10"
              />
              <button
                type="button"
                aria-label="Choose profile photo source"
                aria-haspopup="listbox"
                aria-expanded={isPhotoMenuOpen}
                onClick={() => setIsPhotoMenuOpen((isOpen) => !isOpen)}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-fuchsia-300"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={`size-4 transition-transform ${isPhotoMenuOpen ? "rotate-180" : ""}`}>
                  <path fillRule="evenodd" d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>

              {isPhotoMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Profile photo options"
                  className="absolute right-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-violet-300/20 bg-[#211b35] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={photoMode === "url"}
                    onClick={() => {
                      setPhotoMode("url");
                      setUploadedPhoto("");
                      setPhotoFileName("");
                      setIsPhotoMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/85 transition hover:bg-violet-400/15 hover:text-white"
                  >
                    Use a photo URL
                  </button>
                  <button
                    type="button"
                    role="option"
                    aria-selected={photoMode === "upload"}
                    onClick={() => {
                      setIsPhotoMenuOpen(false);
                      photoFileInputRef.current?.click();
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/85 transition hover:bg-fuchsia-400/15 hover:text-white"
                  >
                    Upload a JPG or PNG
                  </button>
                </div>
              )}
            </div>
            <input
              ref={photoFileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handlePhotoFileChange}
              className="sr-only"
              tabIndex={-1}
              aria-label="Upload a JPG or PNG profile photo"
            />
            {uploadedPhoto ? (
              <div className="group relative mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
                <Image
                  src={uploadedPhoto}
                  alt="Selected profile photo preview"
                  width={48}
                  height={48}
                  unoptimized
                  className="size-12 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-xs text-white/70">
                  {photoFileName}
                </span>
              </div>
            ) : (
              <p className="mt-1.5 text-xs text-white/45">
                Use the dropdown button to choose a JPG or PNG, or enter a public image URL.
              </p>
            )}
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
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.25)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_30px_rgba(236,72,153,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
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
