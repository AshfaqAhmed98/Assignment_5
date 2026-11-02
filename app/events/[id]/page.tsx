import { Suspense } from "react";
import EventDetailsClient from "@/components/event-details";

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-[#0b0b12] px-5 py-20 text-sm text-white/60">
          Loading event details…
        </main>
      }
    >
      <LoadEventDetails params={params} />
    </Suspense>
  );
}

async function LoadEventDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetailsClient eventId={id} />;
}
