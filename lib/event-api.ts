import type { PublicEvent } from "@/lib/events";

type EventListResponse = {
  events: PublicEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function isPublicEvent(value: unknown): value is PublicEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const event = value as Record<string, unknown>;
  return (
    typeof event.id === "string" &&
    typeof event.title === "string" &&
    typeof event.description === "string" &&
    typeof event.type === "string" &&
    typeof event.thumbnailUrl === "string" &&
    typeof event.location === "string" &&
    typeof event.eventDate === "string"
  );
}

async function getErrorMessage(response: Response) {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object") {
      const error = (body as Record<string, unknown>).error;
      if (error && typeof error === "object") {
        const message = (error as Record<string, unknown>).message;
        if (typeof message === "string") {
          return message;
        }
      }
    }
  } catch {
    return `Request failed with status ${response.status}.`;
  }

  return `Request failed with status ${response.status}.`;
}

export async function getUpcomingEvents(limit: number, page = 1) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort: "eventDate",
    order: "asc",
  });
  const response = await fetch(`/backend/api/events?${query}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const body: unknown = await response.json();
  if (!body || typeof body !== "object") {
    throw new Error("The event service returned an invalid response.");
  }

  const result = body as Record<string, unknown>;
  const pagination = result.pagination;
  if (
    !Array.isArray(result.events) ||
    !result.events.every(isPublicEvent) ||
    !pagination ||
    typeof pagination !== "object"
  ) {
    throw new Error("The event service returned an invalid response.");
  }

  return {
    events: result.events,
    pagination: pagination as EventListResponse["pagination"],
  };
}

export async function getEvent(id: string) {
  const response = await fetch(`/backend/api/events/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== "object" ||
    !isPublicEvent((body as Record<string, unknown>).event)
  ) {
    throw new Error("The event service returned an invalid response.");
  }

  return (body as { event: PublicEvent }).event;
}

export async function joinEvent(token: string, id: string) {
  const response = await fetch(
    `/backend/api/events/${encodeURIComponent(id)}/join`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== "object" ||
    !isPublicEvent((body as Record<string, unknown>).event)
  ) {
    throw new Error("The event service returned an invalid response.");
  }

  return (body as { event: PublicEvent }).event;
}

export async function getEventJoinStatus(token: string, id: string) {
  const response = await fetch(
    `/backend/api/events/${encodeURIComponent(id)}/join`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as Record<string, unknown>).joined !== "boolean" ||
    typeof (body as Record<string, unknown>).isOwner !== "boolean"
  ) {
    throw new Error("The event service returned an invalid response.");
  }

  return body as { joined: boolean; isOwner: boolean };
}

export async function leaveEvent(token: string, id: string) {
  const response = await fetch(
    `/backend/api/events/${encodeURIComponent(id)}/join`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

async function getJoinedEventsPage(
  token: string,
  limit: number,
  page: number,
) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await fetch(`/backend/api/events/joined?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const body: unknown = await response.json();
  if (!body || typeof body !== "object") {
    throw new Error("The event service returned an invalid response.");
  }

  const result = body as Record<string, unknown>;
  const pagination = result.pagination;
  if (
    !Array.isArray(result.events) ||
    !result.events.every(isPublicEvent) ||
    !pagination ||
    typeof pagination !== "object"
  ) {
    throw new Error("The event service returned an invalid response.");
  }

  return {
    events: result.events,
    pagination: pagination as EventListResponse["pagination"],
  };
}

async function getManagedEventsPage(
  token: string,
  limit: number,
  page: number,
) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await fetch(`/backend/api/events/mine?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const body: unknown = await response.json();
  if (!body || typeof body !== "object") {
    throw new Error("The event service returned an invalid response.");
  }

  const result = body as Record<string, unknown>;
  const pagination = result.pagination;
  if (
    !Array.isArray(result.events) ||
    !result.events.every(isPublicEvent) ||
    !pagination ||
    typeof pagination !== "object"
  ) {
    throw new Error("The event service returned an invalid response.");
  }

  return {
    events: result.events,
    pagination: pagination as EventListResponse["pagination"],
  };
}

async function getAllEventPages(
  fetchPage: (page: number) => Promise<EventListResponse>,
) {
  const firstPage = await fetchPage(1);
  const events = [...firstPage.events];

  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const result = await fetchPage(page);
    events.push(...result.events);
  }

  return { events, pagination: firstPage.pagination };
}

export async function getJoinedEvents(token: string, limit: number) {
  return getAllEventPages((page) => getJoinedEventsPage(token, limit, page));
}

export async function getManagedEvents(token: string, limit: number) {
  return getAllEventPages((page) => getManagedEventsPage(token, limit, page));
}

export async function updateEvent(
  token: string,
  id: string,
  event: Omit<PublicEvent, "id">,
  thumbnailFile?: File,
) {
  const formData = new FormData();
  formData.append("title", event.title);
  formData.append("description", event.description);
  formData.append("type", event.type);
  formData.append("location", event.location);
  formData.append("eventDate", event.eventDate);
  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile);
  }

  const response = await fetch(`/backend/api/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(thumbnailFile ? {} : { "Content-Type": "application/json" }),
    },
    body: thumbnailFile ? formData : JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== "object" ||
    !isPublicEvent((body as Record<string, unknown>).event)
  ) {
    throw new Error("The event service returned an invalid response.");
  }

  return (body as { event: PublicEvent }).event;
}

export async function deleteEvent(token: string, id: string) {
  const response = await fetch(`/backend/api/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

export async function createEvent(
  token: string,
  event: Omit<PublicEvent, "id">,
  idempotencyKey: string,
  thumbnailFile?: File,
) {
  const formData = new FormData();
  formData.append("title", event.title);
  formData.append("description", event.description);
  formData.append("type", event.type);
  formData.append("location", event.location);
  formData.append("eventDate", event.eventDate);
  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile);
  }

  let response: Response;
  try {
    response = await fetch("/backend/api/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": idempotencyKey,
        ...(thumbnailFile ? {} : { "Content-Type": "application/json" }),
      },
      body: thumbnailFile ? formData : JSON.stringify(event),
    });
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      throw new Error(
        "Could not confirm the event service response. Check your connection and retry; the same event will not be added twice.",
      );
    }
    throw error;
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== "object" ||
    !isPublicEvent((body as Record<string, unknown>).event)
  ) {
    throw new Error("The event service returned an invalid response.");
  }

  return (body as { event: PublicEvent }).event;
}
