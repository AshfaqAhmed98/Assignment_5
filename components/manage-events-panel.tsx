"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { getAccessToken } from "@/lib/auth";
import {
  deleteEvent,
  getManagedEvents,
  updateEvent,
} from "@/lib/event-api";
import {
  eventTypes,
  type ManagedEvent,
} from "@/lib/events";
import EventDateTimePicker from "@/components/event-date-time-picker";
import EventListSkeleton from "@/components/event-list-skeleton";
import EventTypeSelect from "@/components/event-type-select";

export type { ManagedEvent } from "@/lib/events";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#111019] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/15 disabled:cursor-not-allowed disabled:opacity-60";

function toLocalDateTime(value: string) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function EventEditor({
  event,
  onUpdated,
  onDeleted,
}: {
  event: ManagedEvent;
  onUpdated: (updatedEvent: ManagedEvent) => void;
  onDeleted: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [thumbnailMode, setThumbnailMode] = useState<"url" | "upload">("url");
  const [thumbnailUrl, setThumbnailUrl] = useState(event.thumbnailUrl);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
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

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setThumbnailFileName(file.name);
    setErrorMessage("");
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const formData = new FormData(formEvent.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const localEventDate = String(formData.get("eventDate") ?? "");
    const parsedEventDate = new Date(localEventDate);
    const isThumbnailUpload = thumbnailMode === "upload";
    const thumbnailUrl = isThumbnailUpload
      ? ""
      : String(formData.get("thumbnailUrl") ?? "").trim();

    if (!title || title.length > 120) {
      setErrorMessage("Event title is required and must be 120 characters or fewer.");
      return;
    }

    if (!location || location.length > 200) {
      setErrorMessage("Location is required and must be 200 characters or fewer.");
      return;
    }

    if (!description || description.length > 3000) {
      setErrorMessage(
        "Description is required and must be 3000 characters or fewer.",
      );
      return;
    }

    if (isThumbnailUpload && !thumbnailFile) {
      setErrorMessage("Choose a JPG or PNG thumbnail image.");
      return;
    }

    if (!isThumbnailUpload && (!thumbnailUrl || thumbnailUrl.length > 2048)) {
      setErrorMessage("Thumbnail URL is required and must be 2048 characters or fewer.");
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

    let parsedThumbnailUrl = "";
    if (!isThumbnailUpload) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(thumbnailUrl);
      } catch {
        setErrorMessage("Enter a valid thumbnail URL.");
        return;
      }

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setErrorMessage("Thumbnail URLs must use HTTP or HTTPS.");
        return;
      }
      parsedThumbnailUrl = parsedUrl.toString();
    }

    const typeValue = String(formData.get("type") ?? "");
    const eventType = eventTypes.find((type) => type === typeValue);
    if (!eventType) {
      setErrorMessage("Choose a valid event type.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setErrorMessage("Your session has expired. Sign in again to manage events.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedEvent = await updateEvent(token, event.id, {
        title,
        description,
        type: eventType,
        thumbnailUrl: parsedThumbnailUrl,
        location,
        eventDate: parsedEventDate.toISOString(),
      }, thumbnailFile ?? undefined);
      onUpdated(updatedEvent);
      setThumbnailUrl(updatedEvent.thumbnailUrl);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setThumbnailFileName("");
      setThumbnailMode("url");
      setSuccessMessage("Event updated successfully.");
      setIsEditing(false);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update this event.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    const token = getAccessToken();
    if (!token) {
      setErrorMessage("Your session has expired. Sign in again to manage events.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEvent(token, event.id);
      onDeleted(event.id);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete this event.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const eventDate = new Date(event.eventDate);

  return (
    <article className="rounded-2xl border border-white/10 bg-[#171421]">
      {!isEditing ? (
        <div className="grid gap-5 p-4 sm:grid-cols-[220px_1fr] sm:p-5">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <Image
              src={event.thumbnailUrl}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 220px"
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold text-fuchsia-100">
                {event.type}
              </span>
              <time
                dateTime={event.eventDate}
                className="text-xs text-white/55"
              >
                {eventDate.toLocaleString("en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </div>
            <h2 className="mt-3 text-xl font-bold text-white">{event.title}</h2>
            <p className="mt-2 text-sm text-white/60">{event.location}</p>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/65">
              {event.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  setSuccessMessage("");
                  setThumbnailUrl(event.thumbnailUrl);
                  setThumbnailFile(null);
                  setThumbnailPreview("");
                  setThumbnailFileName("");
                  setThumbnailMode("url");
                  setIsEditing(true);
                }}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-violet-200/25 bg-violet-300/10 px-4 text-sm font-bold text-violet-100 transition hover:bg-violet-300/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200"
              >
                Edit event
              </button>
              <Link
                href={`/events/${event.id}`}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-semibold text-white/75 transition hover:bg-white/5 hover:text-white"
              >
                View event
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-rose-200/20 bg-rose-300/5 px-4 text-sm font-bold text-rose-200 transition hover:bg-rose-300/10 disabled:cursor-wait disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6"
        >
          <label className="text-sm font-semibold text-white/85">
            Event title
            <input
              className={fieldClassName}
              name="title"
              required
              maxLength={120}
              minLength={1}
              defaultValue={event.title}
            />
          </label>

          <label
            htmlFor={`manage-event-type-${event.id}`}
            className="text-sm font-semibold text-white/85"
          >
            Event type
            <EventTypeSelect
              id={`manage-event-type-${event.id}`}
              name="type"
              defaultValue={event.type}
            />
          </label>

          <label className="text-sm font-semibold text-white/85">
            Location
            <input
              className={fieldClassName}
              name="location"
              required
              maxLength={200}
              minLength={1}
              defaultValue={event.location}
            />
          </label>

          <label
            htmlFor={`manage-event-date-${event.id}`}
            className="text-sm font-semibold text-white/85"
          >
            Event date and time
            <EventDateTimePicker
              id={`manage-event-date-${event.id}`}
              name="eventDate"
              defaultValue={toLocalDateTime(event.eventDate)}
            />
          </label>

          <div className="text-sm font-semibold text-white/85 sm:col-span-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor={`manage-thumbnail-url-${event.id}`}>
                Thumbnail image
              </label>
              <span className="text-xs font-normal text-white/50">JPG or PNG</span>
            </div>
            <div className="relative">
              {thumbnailMode === "url" ? (
                <input
                  id={`manage-thumbnail-url-${event.id}`}
                  className={`${fieldClassName} pr-12`}
                  name="thumbnailUrl"
                  type="url"
                  required
                  maxLength={2048}
                  autoComplete="off"
                  value={thumbnailUrl}
                  onChange={(inputEvent) => setThumbnailUrl(inputEvent.target.value)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => thumbnailFileInputRef.current?.click()}
                  className={`${fieldClassName} flex min-h-12 items-center justify-between gap-3 pr-12 text-left`}
                >
                  <span className="truncate">
                    {thumbnailFileName || "Choose a JPG or PNG image"}
                  </span>
                  {thumbnailPreview && (
                    <Image
                      src={thumbnailPreview}
                      alt="Selected thumbnail preview"
                      width={64}
                      height={40}
                      unoptimized
                      className="h-10 w-16 shrink-0 rounded-lg object-cover"
                    />
                  )}
                </button>
              )}
              <button
                type="button"
                aria-label="Choose thumbnail image source"
                aria-haspopup="listbox"
                aria-expanded={isThumbnailMenuOpen}
                onClick={() => setIsThumbnailMenuOpen((open) => !open)}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-fuchsia-300"
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
                      setThumbnailFile(null);
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
                      setThumbnailMode("upload");
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
            <span className="mt-1.5 block text-xs font-normal text-white/60">
              Enter a public HTTP or HTTPS URL, or upload a JPG or PNG up to 50 MB.
            </span>
          </div>

          <label className="text-sm font-semibold text-white/85 sm:col-span-2">
            Description
            <textarea
              className={`${fieldClassName} min-h-32 resize-y`}
              name="description"
              required
              maxLength={3000}
              minLength={1}
              defaultValue={event.description}
            />
          </label>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-200 sm:col-span-2"
            >
              {errorMessage}
            </p>
          )}

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMessage("");
                setIsEditing(false);
              }}
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white/75 transition hover:bg-white/5 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {errorMessage && !isEditing && (
        <p
          role="alert"
          className="border-t border-rose-200/10 px-5 py-3 text-sm text-rose-200"
        >
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p
          role="status"
          className="border-t border-emerald-200/10 px-5 py-3 text-sm text-emerald-200"
        >
          {successMessage}
        </p>
      )}
    </article>
  );
}

export default function ManageEventsPanel() {
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        const token = getAccessToken();
        if (!token) {
          throw new Error("Your session has expired. Sign in again to manage events.");
        }

        return getManagedEvents(token, 100);
      })
      .then(({ events: managedEvents }) => {
        if (active) {
          setEvents(managedEvents);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load your events.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateEvent(updatedEvent: ManagedEvent) {
    setEvents((currentEvents) =>
      currentEvents
        .map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        .sort(
          (first, second) =>
            new Date(first.eventDate).getTime() -
            new Date(second.eventDate).getTime(),
        ),
    );
  }

  function removeEvent(id: string) {
    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== id),
    );
  }

  return (
    <main className="flex-1 bg-[#0b0b12] px-4 py-10 text-white sm:px-6 sm:py-14 lg:px-8">
      <section
        aria-labelledby="manage-events-heading"
        className="mx-auto max-w-5xl"
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-300">
              Your events
            </p>
            <h1
              id="manage-events-heading"
              className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              Manage Events
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Update event details or remove events you created.
            </p>
          </div>
          <Link
            href="/create-event"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-bold text-white transition hover:brightness-110"
          >
            Create Event
          </Link>
        </div>

        {isLoading ? (
          <EventListSkeleton count={3} layout="rows" />
        ) : loadError ? (
          <p
            role="alert"
            className="rounded-xl border border-rose-200/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-100"
          >
            {loadError}
          </p>
        ) : events.length > 0 ? (
          <div className="grid gap-4">
            {events.map((event) => (
              <EventEditor
                key={event.id}
                event={event}
                onUpdated={updateEvent}
                onDeleted={removeEvent}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-sm text-white/65">
              You haven’t created any events yet.
            </p>
            <Link
              href="/create-event"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Create your first event
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
