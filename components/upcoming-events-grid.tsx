"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/event-card";
import { getUpcomingEvents } from "@/lib/event-api";
import type { PublicEvent } from "@/lib/events";

export default function UpcomingEventsGrid({
  limit,
}: {
  limit: number;
}) {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    getUpcomingEvents(limit)
      .then(({ events: upcomingEvents }) => {
        if (active) {
          setEvents(upcomingEvents);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load upcoming events.",
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
  }, [limit]);

  if (isLoading) {
    return (
      <p role="status" className="text-sm text-white/60">
        Loading upcoming events…
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
      <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/65">
        There are no upcoming community events yet.
      </p>
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
