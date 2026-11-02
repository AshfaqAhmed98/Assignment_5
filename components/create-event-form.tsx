"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { createEvent } from "@/lib/event-api";
import { getAccessToken } from "@/lib/auth";
import { eventTypes } from "@/lib/events";
import EventDateTimePicker from "@/components/event-date-time-picker";
import EventTypeSelect from "@/components/event-type-select";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#111019] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/15 disabled:cursor-not-allowed disabled:bg-white/5 disabled:opacity-60";

export default function CreateEventForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailMode, setThumbnailMode] = useState<"url" | "upload">("url");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailFileName, setThumbnailFileName] = useState("");
  const [isThumbnailMenuOpen, setIsThumbnailMenuOpen] = useState(false);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    },
    [thumbnailPreview],
  );

  function handleThumbnailFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    const hasSupportedExtension = /\.(jpe?g|png)$/i.test(file.name);
    const hasSupportedType = ["image/jpeg", "image/png"].includes(file.type);

    if (!hasSupportedExtension || !hasSupportedType) {
      setErrorMessage("Choose a JPG or PNG thumbnail image.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("Thumbnail images must be 50 MB or smaller.");
      return;
    }

    setUploadedThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setThumbnailFileName(file.name);
    setThumbnailMode("upload");
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const thumbnailUrlInput = event.currentTarget.elements.namedItem("thumbnailUrl");
    const localEventDate = String(formData.get("eventDate") ?? "");
    const parsedEventDate = new Date(localEventDate);

    if (thumbnailMode === "upload" && !uploadedThumbnail) {
      setErrorMessage("Choose a JPG or PNG thumbnail image.");
      return;
    }

    if (thumbnailMode === "upload") {
      setErrorMessage(
        "Image uploads are not supported yet. Choose a public HTTP or HTTPS image URL instead.",
      );
      return;
    }

    if (
      !(thumbnailUrlInput instanceof HTMLInputElement) ||
      !thumbnailUrlInput.validity.valid
    ) {
      setErrorMessage("Enter a valid thumbnail URL.");
      return;
    }

    const formThumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
    let parsedThumbnailUrl: URL;
    try {
      parsedThumbnailUrl = new URL(formThumbnailUrl);
    } catch {
      setErrorMessage("Enter a valid thumbnail URL.");
      return;
    }

    if (!["http:", "https:"].includes(parsedThumbnailUrl.protocol)) {
      setErrorMessage("Thumbnail URLs must use HTTP or HTTPS.");
      return;
    }

    if (!localEventDate || Number.isNaN(parsedEventDate.getTime())) {
      setErrorMessage("Choose a valid event date and time.");
      return;
    }

    if (parsedEventDate.getTime() <= Date.now()) {
      setErrorMessage("Choose a date and time in the future.");
      return;
    }

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const typeValue = String(formData.get("type") ?? "");
    const location = String(formData.get("location") ?? "").trim();
    const eventType = eventTypes.find((type) => type === typeValue);

    if (!eventType) {
      setErrorMessage("Choose a valid event type.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setErrorMessage("Your session has expired. Sign in again to create an event.");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdEvent = await createEvent(token, {
        title,
        description,
        type: eventType,
        thumbnailUrl: parsedThumbnailUrl.toString(),
        location,
        eventDate: parsedEventDate.toISOString(),
      });
      router.push(`/events/${encodeURIComponent(createdEvent.id)}`);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create the event.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex-1 bg-[#0b0b12] px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <section className="mx-auto grid min-h-[min(780px,calc(100svh-128px))] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#15151d] shadow-[0_24px_80px_rgba(0,0,0,0.4)] lg:grid-cols-[0.78fr_1.22fr]">
        <aside
          className="relative flex min-h-[400px] flex-col justify-between overflow-hidden bg-cover bg-center p-7 text-white sm:p-10 lg:min-h-[720px] lg:p-12"
          style={{ backgroundImage: "url('/community-events-background.jpg')" }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#141225]/35 via-[#141225]/35 to-[#11101e]/95"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-transparent to-fuchsia-950/25"
          />

          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white"
            >
              <span aria-hidden="true">←</span> EventMatrix
            </Link>
            <p className="mt-12 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-200 sm:mt-16">
              <span className="size-1.5 rounded-full bg-fuchsia-300" />
              Create something meaningful
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Bring your community
              <span className="mt-1 block bg-gradient-to-r from-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
                together.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/80 sm:text-base">
              Every great neighborhood event starts with one idea. Share yours
              and make it easy for people nearby to be part of it.
            </p>
          </div>

          <div className="relative mt-12 grid gap-4 border-t border-white/20 pt-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-200/30 bg-violet-300/15 text-violet-100">
                01
              </span>
              <div>
                <p className="text-sm font-bold">Choose your cause</p>
                <p className="mt-1 text-xs leading-5 text-white/65">
                  Cleanup, planting, donations, and more.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-cyan-200/30 bg-cyan-300/15 text-cyan-100">
                02
              </span>
              <div>
                <p className="text-sm font-bold">Invite your neighbors</p>
                <p className="mt-1 text-xs leading-5 text-white/65">
                  Add the details so everyone knows where to meet.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="bg-[#15151d] px-5 py-8 text-white sm:px-9 sm:py-10 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
              <span className="size-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(196,181,253,0.65)]" />
              Your next community event
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Create an event
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              Add the essentials below. A clear description and a welcoming
              image help people picture themselves joining in.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-7 grid gap-x-5 gap-y-4 sm:grid-cols-2"
            >
              <label className="text-sm font-semibold text-white/90">
                Event title
                <input
                  className={fieldClassName}
                  name="title"
                  required
                  maxLength={120}
                  placeholder="e.g. Riverside Park Cleanup"
                />
              </label>

              <label
                htmlFor="create-event-type"
                className="text-sm font-semibold text-white/90"
              >
                Event type
                <EventTypeSelect id="create-event-type" name="type" />
              </label>

              <label className="text-sm font-semibold text-white/90">
                Location
                <input
                  className={fieldClassName}
                  name="location"
                  required
                  maxLength={200}
                  placeholder="Venue or meeting point"
                />
              </label>

              <label
                htmlFor="create-event-date"
                className="text-sm font-semibold text-white/90"
              >
                Event date and time
                <EventDateTimePicker
                  id="create-event-date"
                  name="eventDate"
                />
              </label>

              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="thumbnailUrl"
                    className="text-sm font-semibold text-white/90"
                  >
                    Thumbnail image
                  </label>
                  <span className="text-xs text-white/50">JPG or PNG</span>
                </div>
                <div
                  className="relative"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setIsThumbnailMenuOpen(false);
                    }
                  }}
                >
                  <input
                    id="thumbnailUrl"
                    className={`${fieldClassName} pr-12`}
                    name="thumbnailUrl"
                    type={thumbnailMode === "url" ? "url" : "text"}
                    inputMode={thumbnailMode === "url" ? "url" : undefined}
                    required={thumbnailMode === "url"}
                    maxLength={2048}
                    value={thumbnailUrl}
                    onChange={(event) => {
                      setThumbnailUrl(event.target.value);
                      setThumbnailMode("url");
                      setUploadedThumbnail(null);
                      setThumbnailPreview("");
                      setThumbnailFileName("");
                      setErrorMessage("");
                      event.currentTarget.setCustomValidity("");
                    }}
                    placeholder="https://example.com/event-photo.jpg"
                  />
                  <button
                    type="button"
                    aria-label="Choose thumbnail image source"
                    aria-haspopup="listbox"
                    aria-expanded={isThumbnailMenuOpen}
                    onClick={() =>
                      setIsThumbnailMenuOpen((isOpen) => !isOpen)
                    }
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-fuchsia-300 disabled:cursor-not-allowed"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`size-4 transition-transform ${isThumbnailMenuOpen ? "rotate-180" : ""}`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {isThumbnailMenuOpen && (
                    <div
                      role="listbox"
                      aria-label="Thumbnail image options"
                      className="absolute right-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-violet-300/20 bg-[#211b35] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={thumbnailMode === "url"}
                        onClick={() => {
                          setThumbnailMode("url");
                          setUploadedThumbnail(null);
                          setThumbnailPreview("");
                          setThumbnailFileName("");
                          setIsThumbnailMenuOpen(false);
                        }}
                        className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/85 transition hover:bg-violet-400/15 hover:text-white"
                      >
                        Use an image URL
                      </button>
                      <button
                        type="button"
                        role="option"
                        aria-selected={thumbnailMode === "upload"}
                        onClick={() => {
                          setIsThumbnailMenuOpen(false);
                          thumbnailFileInputRef.current?.click();
                        }}
                        className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/85 transition hover:bg-fuchsia-400/15 hover:text-white"
                      >
                        Upload a JPG or PNG
                      </button>
                    </div>
                  )}
                </div>
                <input
                  ref={thumbnailFileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleThumbnailFileChange}
                  className="sr-only"
                  tabIndex={-1}
                  aria-label="Upload a JPG or PNG thumbnail"
                />
                {uploadedThumbnail ? (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
                    <Image
                      src={thumbnailPreview}
                      alt="Selected event thumbnail preview"
                      width={64}
                      height={48}
                      unoptimized
                      className="h-12 w-16 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-xs text-white/70">
                      {thumbnailFileName}
                    </span>
                  </div>
                ) : (
                  <span className="mt-1.5 block text-xs font-normal text-white/60">
                    Uploaded images are preview-only. Use a public HTTP or HTTPS
                    URL to create the event.
                  </span>
                )}
              </div>

              <label className="text-sm font-semibold text-white/90 sm:col-span-2">
                Event description
                <textarea
                  className={`${fieldClassName} min-h-28 resize-y`}
                  name="description"
                  required
                  maxLength={3000}
                  placeholder="What will happen? Who can join? What should people bring?"
                />
              </label>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-300/20 bg-rose-950/40 px-4 py-3 text-sm text-rose-100 sm:col-span-2"
                >
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.3)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_30px_rgba(219,39,119,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-60 sm:col-span-2 sm:w-fit"
              >
                {isSubmitting ? "Creating event…" : "Create event"}
                <span aria-hidden="true">→</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
