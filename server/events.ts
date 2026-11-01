export const eventTypes = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Community Gathering",
  "Workshop",
  "Other",
] as const;

export type EventType = (typeof eventTypes)[number];

export type EventRecord = {
  title: string;
  description: string;
  type: EventType;
  thumbnailUrl: string;
  location: string;
  eventDate: Date;
  createdByEmail: string;
  createdAt: Date;
};

export type EventJoinRecord = {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventType: EventType;
  eventLocation: string;
  userId: string;
  userEmail: string;
  userName: string;
  joinedAt: Date;
};

export function isUpcomingEventDate(eventDate: Date) {
  return eventDate.getTime() > Date.now();
}
