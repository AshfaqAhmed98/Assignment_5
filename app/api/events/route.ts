import {
  auth,
  connectMongo,
  eventsCollection,
} from "@/server/auth";
import { eventTypes, type EventType } from "@/server/events";
import { getUpcomingEvents } from "@/server/event-queries";
import {
  deleteStoredEventThumbnail,
  storeEventThumbnail,
  validateEventThumbnail,
} from "@/server/event-thumbnails";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function isEventType(value: unknown): value is EventType {
  return eventTypes.some((eventType) => eventType === value);
}

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    const events = await getUpcomingEvents();

    return Response.json({
      events: events.map((event) => ({
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        type: event.type,
        thumbnailUrl: event.thumbnailUrl,
        location: event.location,
        eventDate: event.eventDate.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Unable to load upcoming events:", error);
    return jsonError("Unable to load upcoming events right now.", 500);
  }
}

export async function POST(request: Request) {
  let session;
  try {
    await connectMongo();
    session = await auth.api.getSession({ headers: request.headers });
  } catch (error) {
    console.error("Unable to verify event creator session:", error);
    return jsonError("Authentication is temporarily unavailable.", 503);
  }

  if (!session?.user.email) {
    return jsonError("Sign in to create an event.", 401);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 52 * 1024 * 1024) {
    return jsonError("Thumbnail uploads must be 50 MB or smaller.", 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("The submitted event form is invalid.", 400);
  }

  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const type = getStringField(formData, "type");
  const thumbnailUrl = getStringField(formData, "thumbnailUrl");
  const location = getStringField(formData, "location");
  const eventDateValue = getStringField(formData, "eventDate");
  const thumbnailValue = formData.get("thumbnail");
  const uploadedThumbnail =
    thumbnailValue instanceof File && thumbnailValue.size > 0
      ? thumbnailValue
      : null;

  if (!title || title.length > 120) {
    return jsonError("Event title is required and must be 120 characters or fewer.", 400);
  }

  if (!description || description.length > 3000) {
    return jsonError(
      "Event description is required and must be 3,000 characters or fewer.",
      400,
    );
  }

  if (!isEventType(type)) {
    return jsonError("Choose a valid event type.", 400);
  }

  if (uploadedThumbnail) {
    const validation = await validateEventThumbnail(uploadedThumbnail);
    if (validation) {
      return jsonError(validation.message, validation.status);
    }
  } else {
    if (!thumbnailUrl || thumbnailUrl.length > 2048) {
      return jsonError(
        "Thumbnail URL is required and must be 2,048 characters or fewer.",
        400,
      );
    }

    try {
      const imageUrl = new URL(thumbnailUrl);
      if (!["http:", "https:"].includes(imageUrl.protocol)) {
        return jsonError("Thumbnail URL must use HTTP or HTTPS.", 400);
      }
    } catch {
      return jsonError("Enter a valid thumbnail image URL.", 400);
    }
  }

  if (!location || location.length > 200) {
    return jsonError("Event location is required and must be 200 characters or fewer.", 400);
  }

  const eventDate = new Date(eventDateValue);
  if (!eventDateValue || Number.isNaN(eventDate.getTime())) {
    return jsonError("Enter a valid event date and time.", 400);
  }

  if (eventDate.getTime() <= Date.now()) {
    return jsonError("Event date and time must be in the future.", 400);
  }

  let storedThumbnailUrl = thumbnailUrl;

  if (uploadedThumbnail) {
    try {
      storedThumbnailUrl = await storeEventThumbnail(uploadedThumbnail);
    } catch (error) {
      console.error("Unable to store event thumbnail:", error);
      return jsonError("Unable to store the thumbnail image. Please try again.", 500);
    }
  }

  try {
    const result = await eventsCollection.insertOne({
      title,
      description,
      type,
      thumbnailUrl: storedThumbnailUrl,
      location,
      eventDate,
      createdByEmail: session.user.email,
      createdAt: new Date(),
    });

    return Response.json(
      { event: { id: result.insertedId.toString() } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to create event:", error);
    if (uploadedThumbnail && storedThumbnailUrl !== thumbnailUrl) {
      try {
        await deleteStoredEventThumbnail(storedThumbnailUrl);
      } catch (cleanupError) {
        console.error("Unable to remove unreferenced event thumbnail:", cleanupError);
      }
    }
    return jsonError("Unable to save the event right now. Please try again.", 500);
  }
}
