"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
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

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const formData = new FormData(formEvent.currentTarget);
    const localEventDate = String(formData.get("eventDate") ?? "");
    const parsedEventDate = new Date(localEventDate);
    const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();

    if (!localEventDate || Number.isNaN(parsedEventDate.getTime())) {
      setErrorMessage("Choose a valid event date and time.");
      return;
    }

    if (parsedEventDate.getTime() <= Date.now()) {
      setErrorMessage("Choose a date and time in the future.");
      return;
    }

    let parsedThumbnailUrl: URL;
    try {
      parsedThumbnailUrl = new URL(thumbnailUrl);
    } catch {
      setErrorMessage("Enter a valid thumbnail URL.");
      return;
    }

    if (!["http:", "https:"].includes(parsedThumbnailUrl.protocol)) {
      setErrorMessage("Thumbnail URLs must use HTTP or HTTPS.");
      return;
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
        title: String(formData.get("title") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        type: eventType,
        thumbnailUrl: parsedThumbnailUrl.toString(),
        location: String(formData.get("location") ?? "").trim(),
        eventDate: parsedEventDate.toISOString(),
      });
      onUpdated(updatedEvent);
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
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#171421]">
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
          className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6"
        >
          <label className="text-sm font-semibold text-white/85">
            Event title
            <input
              className={fieldClassName}
              name="title"
              required
              maxLength={120}
              defaultValue={event.title}
            />
          </label>

          <label className="text-sm font-semibold text-white/85">
            Event type
            <select
              className={fieldClassName}
              name="type"
              required
              defaultValue={event.type}
            >
              {eventTypes.map((type) => (
                <option key={type} value={type} className="bg-[#171421]">
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-white/85">
            Location
            <input
              className={fieldClassName}
              name="location"
              required
              maxLength={200}
              defaultValue={event.location}
            />
          </label>

          <label className="text-sm font-semibold text-white/85">
            Event date and time
            <input
              className={`${fieldClassName} [color-scheme:dark]`}
              name="eventDate"
              type="datetime-local"
              required
              defaultValue={toLocalDateTime(event.eventDate)}
            />
          </label>

          <label className="text-sm font-semibold text-white/85 sm:col-span-2">
            Thumbnail image URL
            <input
              className={fieldClassName}
              name="thumbnailUrl"
              type="url"
              required
              maxLength={2048}
              defaultValue={event.thumbnailUrl}
            />
          </label>

          <label className="text-sm font-semibold text-white/85 sm:col-span-2">
            Description
            <textarea
              className={`${fieldClassName} min-h-32 resize-y`}
              name="description"
              required
              maxLength={3000}
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
          <p role="status" className="text-sm text-white/60">
            Loading your events…
          </p>
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
