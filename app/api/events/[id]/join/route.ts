import { MongoServerError, ObjectId } from "mongodb";
import {
  auth,
  connectMongo,
  ensureEventJoinsIndex,
  eventJoinsCollection,
  eventsCollection,
} from "@/server/auth";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return jsonError("Event not found.", 404);
  }

  let session;
  try {
    await connectMongo();
    session = await auth.api.getSession({ headers: request.headers });
  } catch (error) {
    console.error("Unable to verify event participant session:", error);
    return jsonError("Authentication is temporarily unavailable.", 503);
  }

  if (!session?.user.id || !session.user.email) {
    return jsonError("Sign in to join this event.", 401);
  }

  try {
    const event = await eventsCollection.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          title: 1,
          type: 1,
          location: 1,
          eventDate: 1,
        },
      },
    );

    if (!event) {
      return jsonError("Event not found.", 404);
    }

    if (event.eventDate.getTime() <= Date.now()) {
      return jsonError("This event has already taken place.", 410);
    }

    await ensureEventJoinsIndex();
    try {
      await eventJoinsCollection.insertOne({
        eventId: id,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventType: event.type,
        eventLocation: event.location,
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        joinedAt: new Date(),
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        return Response.json({ joined: true, alreadyJoined: true });
      }

      throw error;
    }

    return Response.json({ joined: true }, { status: 201 });
  } catch (error) {
    console.error("Unable to join event:", error);
    return jsonError("Unable to join this event right now.", 500);
  }
}
