import { Suspense } from "react";
import Link from "next/link";
import EventCreatedNotice from "@/components/event-created-notice";
import UpcomingEventsGrid from "@/components/upcoming-events-grid";

export default function UpcomingEventsPage() {
  return (
    <main className="flex-1 bg-[#15111f] px-5 py-12 text-white sm:px-8 sm:py-16">
      <section aria-labelledby="events-heading" className="mx-auto max-w-6xl">
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

        <Suspense fallback={null}>
          <EventCreatedNotice />
        </Suspense>
        <UpcomingEventsGrid
          limit={12}
          cardVariant="neon"
          showPagination
        />
      </section>
    </main>
  );
}
