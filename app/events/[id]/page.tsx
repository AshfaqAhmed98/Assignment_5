import { Suspense } from "react";
import EventDetailsClient from "@/components/event-details";
import EventDetailsSkeleton from "@/components/event-details-skeleton";

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<EventDetailsSkeleton />}
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
