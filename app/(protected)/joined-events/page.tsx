import Link from "next/link";
import EventCard from "@/components/event-card";
import AuthGate from "@/components/auth-gate";
import { sampleEvents } from "@/lib/events";

export default function JoinedEventsPage() {
  const events = sampleEvents.slice(0, 2);
  return (
    <AuthGate>
    <main className="flex-1 bg-[#15111f] px-5 py-12 text-white sm:px-8 sm:py-16">
      <section aria-labelledby="joined-events-heading" className="mx-auto max-w-6xl">
        <div className="mb-9 max-w-2xl">
          <p className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300 bg-clip-text text-xs font-semibold uppercase tracking-[0.22em] text-transparent sm:text-sm">
            Your community calendar
          </p>
          <h1
            id="joined-events-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Joined events
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/65 sm:text-base">
            A sample of how joined events could look.
          </p>
        </div>

        <p className="mb-5 rounded-xl border border-amber-200/20 bg-amber-300/5 px-4 py-3 text-sm text-amber-100">
          UI preview: these are examples only; joining an event does not save a
          registration.
        </p>

        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-sm text-white/65">
              No sample events are available.
            </p>
            <Link
              href="/events"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-bold text-white transition hover:brightness-110"
            >
              Explore upcoming events
            </Link>
          </div>
        )}
      </section>
    </main>
    </AuthGate>
  );
}
