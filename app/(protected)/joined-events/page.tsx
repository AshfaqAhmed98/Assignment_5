import Link from "next/link";
import AuthGate from "@/components/auth-gate";
import JoinedEventsGrid from "@/components/joined-events-grid";

export default function JoinedEventsPage() {
  return (
    <AuthGate>
      <main className="flex-1 bg-[#15111f] px-5 py-12 text-white sm:px-8 sm:py-16">
        <section
          aria-labelledby="joined-events-heading"
          className="mx-auto max-w-6xl"
        >
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
              Keep track of the events you have signed up for.
            </p>
          </div>

          <JoinedEventsGrid />

          <Link
            href="/events"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-bold text-white transition hover:brightness-110"
          >
            Explore upcoming events
          </Link>
        </section>
      </main>
    </AuthGate>
  );
}
