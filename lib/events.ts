export const eventTypes = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Community Gathering",
  "Workshop",
  "Other",
] as const;

export type EventType = (typeof eventTypes)[number];

export type PublicEvent = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  thumbnailUrl: string;
  location: string;
  eventDate: string;
};

export type ManagedEvent = PublicEvent;

export const sampleEvents: PublicEvent[] = [
  {
    id: "neighborhood-cleanup",
    title: "Neighborhood Cleanup Day",
    description:
      "Help tidy shared paths and green spaces, meet your neighbors, and make the area more welcoming for everyone.",
    type: "Cleanup",
    thumbnailUrl: "/gallery-cleanup.jpg",
    location: "Riverside Community Park",
    eventDate: "2027-05-15T09:00:00.000Z",
  },
  {
    id: "community-garden-workshop",
    title: "Community Garden Workshop",
    description:
      "Learn the basics of planting seasonal vegetables and caring for a shared community garden.",
    type: "Workshop",
    thumbnailUrl: "/gallery-volunteers.jpg",
    location: "Maple Street Community Garden",
    eventDate: "2027-05-22T14:00:00.000Z",
  },
  {
    id: "neighbors-gathering",
    title: "Neighbors Together",
    description:
      "Spend an afternoon connecting with local residents and sharing ideas for community projects.",
    type: "Community Gathering",
    thumbnailUrl: "/gallery-gathering.jpg",
    location: "Eastside Community Hall",
    eventDate: "2027-06-05T16:30:00.000Z",
  },
];
