"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/event-card";
import { getAccessToken } from "@/lib/auth";
import { getJoinedEvents } from "@/lib/event-api";
import type { PublicEvent } from "@/lib/events";

export default function JoinedEventsGrid() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  if (isLoading) {
    return (
      <p role="status" className="text-sm text-white/60">
        Loading your joined events…
      </p>
    );
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
