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
import { useAuth } from "@/lib/auth";

type RegistrationForm = {
  name: string;
  email: string;
  photoURL: string;
  password: string;
};

export default function RegisterPage() {
  const { register } = useAuth();
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
  const [uploadedPhotoFile, setUploadedPhotoFile] = useState<File | null>(null);
  const [photoFileName, setPhotoFileName] = useState("");
  const [photoPreviewFailed, setPhotoPreviewFailed] = useState(false);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<AuthToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

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
      setUploadedPhotoFile(file);
      setPhotoFileName(file.name);
      setPhotoPreviewFailed(false);
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
    const photoURL = form.photoURL.trim();

    const name = form.name.trim();
    if (!name || name.length > 80) {
      setToast({
        type: "error",
        message: "Name is required and must be 80 characters or fewer.",
      });
      return;
    }

    if (
      !(emailInput instanceof HTMLInputElement) ||
      !emailInput.validity.valid ||
      emailInput.value.trim().length > 254
    ) {
      setToast({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    if (photoMode === "url" && photoURL) {
      if (
        !(photoUrlInput instanceof HTMLInputElement) ||
        !photoUrlInput.validity.valid
      ) {
        setToast({
          type: "error",
          message: "Please enter a valid profile photo URL.",
        });
        return;
      }

      try {
        const photoUrl = new URL(photoURL);
        if (!["http:", "https:"].includes(photoUrl.protocol)) {
          throw new Error("Unsupported profile photo URL protocol.");
        }
      } catch {
        setToast({
          type: "error",
          message: "Profile photo URLs must start with http:// or https://.",
        });
        return;
      }
    }

    if (photoMode === "upload" && !uploadedPhotoFile) {
      setToast({ type: "error", message: "Choose a JPG or PNG profile photo." });
      return;
    }

    if (
      form.password.length < 6 ||
      form.password.length > 128 ||
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password)
    ) {
      setToast({
        type: "error",
        message:
          "Password must be 6–128 characters and include an uppercase and a lowercase letter.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await register(
        name,
        form.email.trim(),
        form.password,
        photoMode === "url" ? form.photoURL.trim() : undefined,
        photoMode === "upload" ? uploadedPhotoFile ?? undefined : undefined,
      );
      setToast({
        type: "success",
        message: "Account created successfully.",
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
    { label: "At least 6 characters", valid: form.password.length >= 6 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(form.password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(form.password) },
    { label: "No more than 128 characters", valid: form.password.length <= 128 },
  ];
  let photoPreview = uploadedPhoto;
  if (!photoPreview && form.photoURL.trim()) {
    try {
      const photoURL = new URL(form.photoURL.trim());
      if (["http:", "https:"].includes(photoURL.protocol)) {
        photoPreview = photoURL.toString();
      }
    } catch {
      photoPreview = "";
    }
  }

  function removePhoto() {
    setUploadedPhoto("");
    setUploadedPhotoFile(null);
    setPhotoFileName("");
    setPhotoPreviewFailed(false);
    setPhotoMode("url");
    setForm((current) => ({ ...current, photoURL: "" }));
  }

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
              maxLength={80}
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
              maxLength={254}
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
              className={`relative ${isPhotoMenuOpen ? "z-30" : ""}`}
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
                maxLength={2048}
                value={form.photoURL}
                onChange={(event) => {
                  updateField("photoURL", event.target.value);
                  setUploadedPhoto("");
                  setUploadedPhotoFile(null);
                  setPhotoFileName("");
                  setPhotoPreviewFailed(false);
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
                className={`form-source-trigger ${isPhotoMenuOpen ? "form-source-trigger-open" : ""}`}
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={`size-4 transition-transform ${isPhotoMenuOpen ? "rotate-180" : ""}`}>
                  <path fillRule="evenodd" d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>

              {isPhotoMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Profile photo options"
                  className="form-source-options"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={photoMode === "url"}
                    onClick={() => {
                      setPhotoMode("url");
                      setUploadedPhoto("");
                      setUploadedPhotoFile(null);
                      setPhotoFileName("");
                      setPhotoPreviewFailed(false);
                      setIsPhotoMenuOpen(false);
                    }}
                    className="form-source-option"
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
                    className="form-source-option"
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
            {photoPreview && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                {photoPreviewFailed ? (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-white/55">
                    Preview unavailable
                  </div>
                ) : (
                  <Image
                    key={photoPreview}
                    src={photoPreview}
                    alt="Profile photo preview"
                    width={64}
                    height={64}
                    unoptimized
                    onError={() => setPhotoPreviewFailed(true)}
                    className="size-16 shrink-0 rounded-full object-cover ring-2 ring-fuchsia-300/50"
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-xs text-white/70">
                  {photoFileName || "Profile photo preview"}
                </span>
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label="Remove profile photo"
                  title="Remove profile photo"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/65 transition hover:border-rose-300/40 hover:bg-rose-400/15 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                    <path d="M5.28 5.28a.75.75 0 0 1 1.06 0L10 8.94l3.66-3.66a.75.75 0 1 1 1.06 1.06L11.06 10l3.66 3.66a.75.75 0 1 1-1.06 1.06L10 11.06l-3.66 3.66a.75.75 0 1 1-1.06-1.06L8.94 10 5.28 6.34a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="mt-1.5 text-xs text-white/45">
              {uploadedPhoto
                ? "This photo will be saved to your profile and shown in the navbar."
                : "Optional: enter a public image URL or upload a JPG or PNG profile photo."}
            </p>
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
                minLength={6}
                maxLength={128}
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
              className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2"
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
