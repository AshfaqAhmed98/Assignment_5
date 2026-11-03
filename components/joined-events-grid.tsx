"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/event-card";
import EventListSkeleton from "@/components/event-list-skeleton";
import { getAccessToken } from "@/lib/auth";
import { getJoinedEvents, leaveEvent } from "@/lib/event-api";
import type { PublicEvent } from "@/lib/events";

export default function JoinedEventsGrid() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [leavingEventId, setLeavingEventId] = useState("");
  const [leaveError, setLeaveError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        const token = getAccessToken();
        if (!token) {
          throw new Error("Sign in again to view your joined events.");
        }

        return getJoinedEvents(token, 100);
      })
      .then(({ events: joinedEvents }) => {
        if (active) {
          setEvents(joinedEvents);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load joined events.",
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

  async function handleLeaveEvent(eventId: string) {
    const token = getAccessToken();
    if (!token) {
      setLeaveError("Sign in again to update your joined events.");
      return;
    }

    setLeavingEventId(eventId);
    setLeaveError("");
    try {
      await leaveEvent(token, eventId);
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== eventId),
      );
    } catch (error: unknown) {
      setLeaveError(
        error instanceof Error ? error.message : "Unable to leave this event.",
      );
    } finally {
      setLeavingEventId("");
    }
  }

  if (isLoading) {
    return <EventListSkeleton count={6} />;
  }

  if (errorMessage) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-100"
      >
        {errorMessage}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
        <p className="text-sm text-white/65">
          You have not joined any events yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {leaveError && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-rose-200/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-100"
        >
          {leaveError}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="flex min-w-0 flex-col gap-3">
            <EventCard event={event} />
            <button
              type="button"
              onClick={() => void handleLeaveEvent(event.id)}
              disabled={leavingEventId !== ""}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-rose-300/25 bg-rose-300/5 px-4 text-sm font-semibold text-rose-200 transition hover:border-rose-300/45 hover:bg-rose-300/10 disabled:cursor-wait disabled:opacity-60"
            >
              {leavingEventId === event.id
                ? "Removing…"
                : "Remove from joined events"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
