import { Readable } from "node:stream";
import { ObjectId } from "mongodb";
import { connectMongo, eventImagesBucket } from "@/server/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return Response.json({ error: "Thumbnail not found." }, { status: 404 });
  }

  try {
    await connectMongo();
    const objectId = new ObjectId(id);
    const file = await eventImagesBucket.find({ _id: objectId }).next();

    if (!file) {
      return Response.json({ error: "Thumbnail not found." }, { status: 404 });
    }

    const contentType = file.metadata?.contentType;
    if (contentType !== "image/jpeg" && contentType !== "image/png") {
      return Response.json({ error: "Thumbnail format is not supported." }, { status: 415 });
    }

    const imageStream = Readable.toWeb(
      eventImagesBucket.openDownloadStream(objectId),
    ) as ReadableStream<Uint8Array>;

    return new Response(imageStream, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(file.length),
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Unable to load event thumbnail:", error);
    return Response.json(
      { error: "Unable to load this thumbnail right now." },
      { status: 500 },
    );
  }
}
