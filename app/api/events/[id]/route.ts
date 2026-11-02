import { ObjectId } from "mongodb";
import {
  auth,
  connectMongo,
  eventsCollection,
} from "@/server/auth";
import { eventTypes, type EventType } from "@/server/events";
import {
  deleteStoredEventThumbnail,
  storeEventThumbnail,
  validateEventThumbnail,
} from "@/server/event-thumbnails";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isEventType(value: string): value is EventType {
  return eventTypes.some((eventType) => eventType === value);
}

function isValidThumbnailUrl(value: string) {
  if (!value || value.length > 2048) {
    return false;
  }

  if (/^\/api\/events\/images\/[a-f\d]{24}$/i.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function getOwner(request: Request, id: string) {
  let session;

  try {
    await connectMongo();
    session = await auth.api.getSession({ headers: request.headers });
  } catch (error) {
    console.error("Unable to verify event owner session:", error);
    return { error: jsonError("Authentication is temporarily unavailable.", 503) };
  }

  if (!session?.user.email) {
    return { error: jsonError("Sign in to manage your events.", 401) };
  }

  const event = await eventsCollection.findOne({
    _id: new ObjectId(id),
    createdByEmail: session.user.email,
  });

  if (!event) {
    return { error: jsonError("Event not found.", 404) };
  }

  return { event, email: session.user.email };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return jsonError("Event not found.", 404);
  }

  let owner;
  try {
    owner = await getOwner(request, id);
  } catch (error) {
    console.error("Unable to load event for editing:", error);
    return jsonError("Unable to load this event right now.", 500);
  }

  if ("error" in owner) {
    return owner.error;
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
  const typeValue = getStringField(formData, "type");
  const location = getStringField(formData, "location");
  const eventDateValue = getStringField(formData, "eventDate");
  const thumbnailUrl = getStringField(formData, "thumbnailUrl");
  const thumbnailValue = formData.get("thumbnail");
  const uploadedThumbnail =
    thumbnailValue instanceof File && thumbnailValue.size > 0
      ? thumbnailValue
      : null;

  if (!title || title.length > 120) {
    return jsonError(
      "Event title is required and must be 120 characters or fewer.",
      400,
    );
  }

  if (!description || description.length > 3000) {
    return jsonError(
      "Event description is required and must be 3,000 characters or fewer.",
      400,
    );
  }

  if (!isEventType(typeValue)) {
    return jsonError("Choose a valid event type.", 400);
  }

  if (!location || location.length > 200) {
    return jsonError(
      "Event location is required and must be 200 characters or fewer.",
      400,
    );
  }

  const eventDate = new Date(eventDateValue);
  if (!eventDateValue || Number.isNaN(eventDate.getTime())) {
    return jsonError("Enter a valid event date and time.", 400);
  }

  if (!uploadedThumbnail && !isValidThumbnailUrl(thumbnailUrl)) {
    return jsonError("Enter a valid thumbnail image URL.", 400);
  }

  if (uploadedThumbnail) {
    const validation = await validateEventThumbnail(uploadedThumbnail);
    if (validation) {
      return jsonError(validation.message, validation.status);
    }
  }

  let newThumbnailUrl = thumbnailUrl;
  if (uploadedThumbnail) {
    try {
      newThumbnailUrl = await storeEventThumbnail(uploadedThumbnail);
    } catch (error) {
      console.error("Unable to store updated event thumbnail:", error);
      return jsonError(
        "Unable to store the thumbnail image. Please try again.",
        500,
      );
    }
  }

  try {
    const result = await eventsCollection.updateOne(
      { _id: owner.event._id, createdByEmail: owner.email },
      {
        $set: {
          title,
          description,
          type: typeValue,
          thumbnailUrl: newThumbnailUrl,
          location,
          eventDate,
        },
      },
    );

    if (result.matchedCount === 0) {
      if (uploadedThumbnail) {
        try {
          await deleteStoredEventThumbnail(newThumbnailUrl);
        } catch (cleanupError) {
          console.error("Unable to remove unreferenced event thumbnail:", cleanupError);
        }
      }

      return jsonError("Event not found.", 404);
    }
  } catch (error) {
    console.error("Unable to update event:", error);
    if (uploadedThumbnail) {
      try {
        await deleteStoredEventThumbnail(newThumbnailUrl);
      } catch (cleanupError) {
        console.error("Unable to remove unreferenced event thumbnail:", cleanupError);
      }
    }
    return jsonError("Unable to update this event right now.", 500);
  }

  if (owner.event.thumbnailUrl !== newThumbnailUrl) {
    try {
      await deleteStoredEventThumbnail(owner.event.thumbnailUrl);
    } catch (error) {
      console.error("Unable to remove replaced event thumbnail:", error);
    }
  }

  return Response.json({ updated: true, thumbnailUrl: newThumbnailUrl });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return jsonError("Event not found.", 404);
  }

  let owner;
  try {
    owner = await getOwner(request, id);
  } catch (error) {
    console.error("Unable to load event for deletion:", error);
    return jsonError("Unable to load this event right now.", 500);
  }

  if ("error" in owner) {
    return owner.error;
  }

  try {
    const result = await eventsCollection.deleteOne({
      _id: owner.event._id,
      createdByEmail: owner.email,
    });

    if (result.deletedCount === 0) {
      return jsonError("Event not found.", 404);
    }
  } catch (error) {
    console.error("Unable to delete event:", error);
    return jsonError("Unable to delete this event right now.", 500);
  }

  try {
    await deleteStoredEventThumbnail(owner.event.thumbnailUrl);
  } catch (error) {
    console.error("Unable to remove deleted event thumbnail:", error);
  }

  return Response.json({ deleted: true });
}
