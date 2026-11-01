import Link from "next/link";
import { Suspense } from "react";
import EventCard, { type PublicEvent } from "@/components/event-card";
import { getUpcomingEvents } from "@/server/event-queries";

export default function UpcomingEventsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-[#15111f] px-5 py-20 text-sm text-white/60">
          Loading upcoming events…
        </main>
      }
    >
      <UpcomingEventsList />
    </Suspense>
  );
}

async function UpcomingEventsList() {
  let events: PublicEvent[];

  try {
    events = (await getUpcomingEvents()).map((event) => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      type: event.type,
      thumbnailUrl: event.thumbnailUrl,
      location: event.location,
      eventDate: event.eventDate.toISOString(),
    }));
  } catch (error) {
    console.error("Unable to load the upcoming events page:", error);

    return (
      <main className="flex flex-1 items-center justify-center bg-[#15111f] px-5 py-20 text-white">
        <p role="alert" className="text-sm text-rose-200">
          Upcoming events are temporarily unavailable. Please try again later.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#15111f] px-5 py-12 text-white sm:px-8 sm:py-16">
      <section
        aria-labelledby="events-heading"
        className="mx-auto max-w-6xl"
      >
        <div className="mb-9 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300 bg-clip-text text-xs font-semibold uppercase tracking-[0.22em] text-transparent sm:text-sm">
              Make a little time for good
            </p>
            <h1
              id="events-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              Upcoming{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                events
              </span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/65 sm:text-base">
              Explore community events, find one that matters to you, and join
              the people making it happen.
            </p>
          </div>
          <Link
            href="/create-event"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition hover:border-fuchsia-200/40 hover:bg-white/10"
          >
            Create Event
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-sm text-white/65">
              There are no upcoming community events yet.
            </p>
            <Link
              href="/create-event"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-bold text-white transition hover:brightness-110"
            >
              Create the first event
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
