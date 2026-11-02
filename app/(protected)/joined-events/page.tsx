import Link from "next/link";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import EventCard, { type PublicEvent } from "@/components/event-card";
import {
  auth,
  connectMongo,
  eventJoinsCollection,
  eventsCollection,
} from "@/server/auth";

export default function JoinedEventsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-[#15111f] px-5 py-20 text-sm text-white/60">
          Loading your joined events…
        </main>
      }
    >
      <JoinedEventsList />
    </Suspense>
  );
}

async function JoinedEventsList() {
  await connection();
  await connectMongo();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user.id) {
    redirect("/login");
  }

  const joinedEvents = await eventJoinsCollection
    .find({ userId: session.user.id })
    .sort({ eventDate: 1, joinedAt: 1 })
    .toArray();
  const eventIds = joinedEvents
    .map((joinedEvent) => joinedEvent.eventId)
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));
  const currentEvents =
    eventIds.length > 0
      ? await eventsCollection
          .find({ _id: { $in: eventIds } })
          .toArray()
      : [];
  const currentEventsById = new Map(
    currentEvents.map((event) => [event._id.toString(), event]),
  );

  const events = joinedEvents
    .map((joinedEvent) => {
      const currentEvent = currentEventsById.get(joinedEvent.eventId);

      return {
        event: {
          id: joinedEvent.eventId,
          title: currentEvent?.title ?? joinedEvent.eventTitle,
          description:
            currentEvent?.description ?? "You joined this community event.",
          type: currentEvent?.type ?? joinedEvent.eventType,
          thumbnailUrl:
            currentEvent?.thumbnailUrl ?? "/community-events-background.jpg",
          location: currentEvent?.location ?? joinedEvent.eventLocation,
          eventDate: (
            currentEvent?.eventDate ?? joinedEvent.eventDate
          ).toISOString(),
        } satisfies PublicEvent,
        isAvailable: Boolean(currentEvent),
      };
    })
    .sort(
      (first, second) =>
        new Date(first.event.eventDate).getTime() -
        new Date(second.event.eventDate).getTime(),
    );

  return (
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
            Events you’ve joined, arranged by event date.
          </p>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map(({ event, isAvailable }, index) => (
              <EventCard
                key={`${event.id}-${index}`}
                event={event}
                detailsHref={
                  isAvailable ? `/events/${event.id}` : null
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-sm text-white/65">
              You haven’t joined an event yet.
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
  );
}
