"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import EventDetailsSkeleton from "@/components/event-details-skeleton";
import JoinEventButton from "@/components/join-event-button";
import { getEvent } from "@/lib/event-api";
import type { PublicEvent } from "@/lib/events";

export default function EventDetails({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpcoming, setIsUpcoming] = useState(false);

  useEffect(() => {
    let active = true;

    getEvent(eventId)
      .then((loadedEvent) => {
        if (active) {
          setEvent(loadedEvent);
          setIsUpcoming(new Date(loadedEvent.eventDate).getTime() > Date.now());
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load this event.",
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
  }, [eventId]);

  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  if (errorMessage || !event) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-5 bg-[#0b0b12] px-5 py-20 text-white">
        <p role="alert" className="text-sm text-rose-100">
          {errorMessage || "Event was not found."}
        </p>
        <Link
          href="/events"
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          Browse events
        </Link>
      </main>
    );
  }
  const eventDate = new Date(event.eventDate);

  return (
    <main className="flex-1 bg-[#0b0b12] px-4 py-8 text-white sm:px-6 sm:py-12 lg:px-8">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#15151d] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <div className="relative aspect-[16/8] min-h-56 bg-white/5 sm:min-h-80">
          <Image
            src={event.thumbnailUrl}
            alt={`Thumbnail for ${event.title}`}
            fill
            priority
            unoptimized
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#101019] via-transparent to-black/10"
          />
          <Link
            href="/events"
            className="absolute left-5 top-5 inline-flex min-h-10 items-center rounded-full border border-white/20 bg-black/45 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/65"
          >
            <span aria-hidden="true" className="mr-2">
              ←
            </span>
            Upcoming events
          </Link>
        </div>

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold text-fuchsia-100">
                {event.type}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isUpcoming
                    ? "border border-emerald-200/20 bg-emerald-300/10 text-emerald-100"
                    : "border border-white/10 bg-white/5 text-white/55"
                }`}
              >
                {isUpcoming ? "Upcoming" : "Past event"}
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {event.title}
            </h1>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-white/70 sm:text-base">
              {event.description}
            </p>

            <dl className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                  Location
                </dt>
                <dd className="mt-2 text-sm font-medium text-white/85">
                  {event.location}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                  Date and time
                </dt>
                <dd className="mt-2 text-sm font-medium text-white/85">
                  <time dateTime={event.eventDate}>
                    {eventDate.toLocaleString("en", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </time>
                </dd>
              </div>
            </dl>
          </div>

          <aside className="h-fit rounded-2xl border border-violet-200/15 bg-gradient-to-br from-violet-400/10 to-fuchsia-400/5 p-5 sm:p-6 lg:w-64">
            <p className="text-sm font-bold text-white">Be part of it</p>
            <p className="mt-2 text-xs leading-5 text-white/60">
              See how you can take part in this event.
            </p>
            <div className="mt-5">
              {isUpcoming ? (
                <JoinEventButton eventId={event.id} />
              ) : (
                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/50">
                  This event has already taken place.
                </p>
              )}
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
