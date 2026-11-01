import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import {
  auth,
  connectMongo,
  eventImagesBucket,
  eventsCollection,
} from "@/server/auth";
import { eventTypes, type EventType } from "@/server/events";
import { getUpcomingEvents } from "@/server/event-queries";

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

async function* readFileChunks(file: File): AsyncGenerator<Uint8Array> {
  const reader = file.stream().getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }

      yield value;
    }
  } finally {
    reader.releaseLock();
  }
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
    const hasSupportedExtension = /\.(jpe?g|png)$/i.test(uploadedThumbnail.name);
    const hasSupportedType = ["image/jpeg", "image/png"].includes(
      uploadedThumbnail.type,
    );

    if (!hasSupportedExtension || !hasSupportedType) {
      return jsonError("Upload a valid JPG or PNG thumbnail image.", 400);
    }

    if (uploadedThumbnail.size > 50 * 1024 * 1024) {
      return jsonError("Thumbnail images must be 50 MB or smaller.", 413);
    }

    const signature = new Uint8Array(
      await uploadedThumbnail.slice(0, 8).arrayBuffer(),
    );
    const isJpeg =
      uploadedThumbnail.type === "image/jpeg" &&
      signature[0] === 0xff &&
      signature[1] === 0xd8 &&
      signature[2] === 0xff;
    const isPng =
      uploadedThumbnail.type === "image/png" &&
      signature.length === 8 &&
      signature[0] === 0x89 &&
      signature[1] === 0x50 &&
      signature[2] === 0x4e &&
      signature[3] === 0x47 &&
      signature[4] === 0x0d &&
      signature[5] === 0x0a &&
      signature[6] === 0x1a &&
      signature[7] === 0x0a;

    if (!isJpeg && !isPng) {
      return jsonError("The uploaded file is not a valid JPG or PNG image.", 400);
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
  let uploadedImageId: ReturnType<typeof eventImagesBucket.openUploadStream>["id"] | null =
    null;

  if (uploadedThumbnail) {
    const uploadStream = eventImagesBucket.openUploadStream(
      uploadedThumbnail.name,
      {
        metadata: { contentType: uploadedThumbnail.type },
      },
    );
    uploadedImageId = uploadStream.id;

    try {
      await pipeline(
        Readable.from(readFileChunks(uploadedThumbnail)),
        uploadStream,
      );
    } catch (error) {
      console.error("Unable to store event thumbnail:", error);
      return jsonError("Unable to store the thumbnail image. Please try again.", 500);
    }

    storedThumbnailUrl = `/api/events/images/${uploadedImageId.toString()}`;
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
    if (uploadedImageId) {
      try {
        await eventImagesBucket.delete(uploadedImageId);
      } catch (cleanupError) {
        console.error("Unable to remove unreferenced event thumbnail:", cleanupError);
      }
    }
    return jsonError("Unable to save the event right now. Please try again.", 500);
  }
}
