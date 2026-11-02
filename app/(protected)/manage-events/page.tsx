import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import ManageEventsPanel, {
  type ManagedEvent,
} from "@/components/manage-events-panel";
import { auth, connectMongo, eventsCollection } from "@/server/auth";

export default function ManageEventsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-[#0b0b12] px-5 py-20 text-sm text-white/60">
          Loading your events…
        </main>
      }
    >
      <ManagedEventsList />
    </Suspense>
  );
}

async function ManagedEventsList() {
  await connection();
  await connectMongo();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user.email) {
    redirect("/login");
  }

  const events = await eventsCollection
    .find({ createdByEmail: session.user.email })
    .sort({ eventDate: 1, createdAt: -1 })
    .toArray();
  const managedEvents: ManagedEvent[] = events.map((event) => ({
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    type: event.type,
    thumbnailUrl: event.thumbnailUrl,
    location: event.location,
    eventDate: event.eventDate.toISOString(),
  }));

  return <ManageEventsPanel initialEvents={managedEvents} />;
}
