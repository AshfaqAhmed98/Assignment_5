import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { ObjectId } from "mongodb";
import { eventImagesBucket } from "@/server/auth";

export const MAX_EVENT_THUMBNAIL_SIZE = 50 * 1024 * 1024;

export async function validateEventThumbnail(file: File) {
  if (
    !/\.(jpe?g|png)$/i.test(file.name) ||
    !["image/jpeg", "image/png"].includes(file.type)
  ) {
    return {
      message: "Upload a valid JPG or PNG thumbnail image.",
      status: 400,
    };
  }

  if (file.size > MAX_EVENT_THUMBNAIL_SIZE) {
    return {
      message: "Thumbnail images must be 50 MB or smaller.",
      status: 413,
    };
  }

  const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isJpeg =
    file.type === "image/jpeg" &&
    signature[0] === 0xff &&
    signature[1] === 0xd8 &&
    signature[2] === 0xff;
  const isPng =
    file.type === "image/png" &&
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
    return {
      message: "The uploaded file is not a valid JPG or PNG image.",
      status: 400,
    };
  }

  return null;
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

export async function storeEventThumbnail(file: File) {
  const uploadStream = eventImagesBucket.openUploadStream(file.name, {
    metadata: { contentType: file.type },
  });

  try {
    await pipeline(Readable.from(readFileChunks(file)), uploadStream);
  } catch (error) {
    try {
      await eventImagesBucket.delete(uploadStream.id);
    } catch (cleanupError) {
      console.error("Unable to remove incomplete event thumbnail:", cleanupError);
    }

    throw error;
  }

  return `/api/events/images/${uploadStream.id.toString()}`;
}

export function getStoredEventThumbnailId(thumbnailUrl: string) {
  const match = /^\/api\/events\/images\/([a-f\d]{24})$/i.exec(thumbnailUrl);
  return match ? new ObjectId(match[1]) : null;
}

export async function deleteStoredEventThumbnail(thumbnailUrl: string) {
  const id = getStoredEventThumbnailId(thumbnailUrl);
  if (id) {
    await eventImagesBucket.delete(id);
  }
}
