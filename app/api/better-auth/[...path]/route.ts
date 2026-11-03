import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const backendURL = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001"
).replace(/\/$/, "");

function getBetterAuthCookies(
  cookieHeader: string | null,
  sessionCheck: boolean,
) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) => {
      if (!sessionCheck) {
        return /^(__Secure-)?better-auth[.-]/i.test(cookie);
      }

      const match = cookie.match(
        /^((?:__Secure-)?better-auth[.-](?:session_token|dont_remember))=([^;]*)$/i,
      );
      return Boolean(match && match[2].length <= 4096);
    });

  const selectedCookies = sessionCheck
    ? [...new Map(cookies.map((cookie) => [cookie.split("=")[0], cookie])).values()]
    : cookies;

  return selectedCookies.length > 0 ? selectedCookies.join("; ") : null;
}

async function fetchSessionWithoutCookieRefresh(
  target: URL,
  headers: Headers,
) {
  const requestOptions = {
    method: "GET",
    headers: Object.fromEntries(headers),
    maxHeaderSize: 8 * 1024 * 1024,
  };
  const makeRequest =
    target.protocol === "https:" ? httpsRequest : httpRequest;

  return new Promise<Response>((resolve, reject) => {
    const upstreamRequest = makeRequest(
      target,
      requestOptions,
      (upstreamResponse) => {
        const chunks: Buffer[] = [];
        upstreamResponse.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        upstreamResponse.on("error", reject);
        upstreamResponse.on("end", () => {
          const responseHeaders = new Headers();
          for (const name of ["content-type", "cache-control", "pragma"]) {
            const value = upstreamResponse.headers[name];
            if (typeof value === "string") {
              responseHeaders.set(name, value);
            }
          }

          resolve(
            new Response(Buffer.concat(chunks), {
              status: upstreamResponse.statusCode ?? 502,
              headers: responseHeaders,
            }),
          );
        });
      },
    );

    upstreamRequest.on("error", reject);
    upstreamRequest.end();
  });
}

async function proxyAuthRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const sessionCheck =
    request.method === "GET" && path.join("/") === "get-session";
  const target = new URL(
    `/api/better-auth/${path.map(encodeURIComponent).join("/")}`,
    backendURL,
  );
  target.search = request.nextUrl.search;
  if (sessionCheck) {
    target.searchParams.set("disableRefresh", "true");
  }

  const headers = new Headers();
  const headerNames = sessionCheck
    ? ["accept"]
    : [
        "accept",
        "authorization",
        "content-type",
        "origin",
        "user-agent",
        "x-captcha-response",
        "x-2fa-redirect",
      ];
  for (const name of headerNames) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  const cookies = getBetterAuthCookies(
    request.headers.get("cookie"),
    sessionCheck,
  );
  if (cookies) {
    headers.set("cookie", cookies);
  }

  try {
    const upstream = sessionCheck
      ? await fetchSessionWithoutCookieRefresh(target, headers)
      : await fetch(target, {
          method: request.method,
          headers,
          ...(request.method === "GET" || request.method === "HEAD"
            ? {}
            : { body: await request.arrayBuffer() }),
          cache: "no-store",
          redirect: "manual",
        });
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const cause =
      error && typeof error === "object" && "cause" in error
        ? error.cause
        : undefined;
    const details = {
      path: target.pathname,
      message: error instanceof Error ? error.message : String(error),
      cause:
        cause instanceof Error
          ? {
              name: cause.name,
              message: cause.message,
              code:
                "code" in cause && typeof cause.code === "string"
                  ? cause.code
                  : undefined,
            }
          : undefined,
    };
    console.error(
      `Better Auth proxy request failed: ${JSON.stringify(details)}`,
    );
    return Response.json(
      { message: "Unable to reach the authentication server." },
      { status: 502 },
    );
  }
}

export const GET = proxyAuthRequest;
export const HEAD = proxyAuthRequest;
export const POST = proxyAuthRequest;
export const OPTIONS = proxyAuthRequest;
