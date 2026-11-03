"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/event-card";
import EventListSkeleton from "@/components/event-list-skeleton";
import { getUpcomingEvents } from "@/lib/event-api";
import type { PublicEvent } from "@/lib/events";

export default function UpcomingEventsGrid({
  limit,
  cardVariant = "default",
  showPagination = false,
}: {
  limit: number;
  cardVariant?: "default" | "spotlight" | "neon";
  showPagination?: boolean;
}) {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [page, setPage] = useState(1);
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    totalPages: number;
  }>({ total: 0, totalPages: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const requestKey = `${limit}:${page}`;
  const isLoading = loadedRequestKey !== requestKey;

  useEffect(() => {
    let active = true;

    getUpcomingEvents(limit, page)
      .then(({ events: upcomingEvents, pagination: eventPagination }) => {
        if (active) {
          setEvents(upcomingEvents);
          setErrorMessage("");
          setPagination({
            total: eventPagination.total,
            totalPages: eventPagination.totalPages,
          });
          setLoadedRequestKey(requestKey);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load upcoming events.",
          );
          setLoadedRequestKey(requestKey);
        }
      });

    return () => {
      active = false;
    };
  }, [limit, page, requestKey]);

  if (isLoading) {
    return <EventListSkeleton count={Math.min(limit, 6)} />;
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
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} variant={cardVariant} />
        ))}
      </div>
      {showPagination && pagination.totalPages > 1 && (
        <nav
          aria-label="Upcoming event pages"
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            disabled={page === 1 || isLoading}
            onClick={() => setPage((currentPage) => currentPage - 1)}
            className="min-h-10 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Previous
          </button>
          <span aria-live="polite" className="text-sm text-white/65">
            Page {page} of {pagination.totalPages}
            <span className="sr-only">, {pagination.total} events total</span>
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages || isLoading}
            onClick={() => setPage((currentPage) => currentPage + 1)}
            className="min-h-10 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
          </button>
        </nav>
      )}
    </>
  );
}
