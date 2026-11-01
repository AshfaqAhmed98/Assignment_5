import { connectMongo, eventsCollection } from "@/server/auth";

export async function getUpcomingEvents() {
  await connectMongo();

  return eventsCollection
    .find(
      { eventDate: { $gt: new Date() } },
      { projection: { createdByEmail: 0 } },
    )
    .sort({ eventDate: 1 })
    .toArray();
}
