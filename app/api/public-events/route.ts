import { NextRequest, NextResponse } from "next/server";

const publicCacheControl = "public, s-maxage=10, stale-while-revalidate=30";

export async function GET(request: NextRequest) {
  const backendUrl = (
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:3001"
  ).replace(/\/$/, "");
  const query = request.nextUrl.searchParams.toString();

  try {
    const response = await fetch(
      `${backendUrl}/api/events${query ? `?${query}` : ""}`,
      { cache: "no-store" },
    );
    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }
    headers.set(
      "Cache-Control",
      response.ok ? publicCacheControl : "no-store",
    );

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Unable to fetch public events:", error);
    return NextResponse.json(
      { message: "Unable to load events right now." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
