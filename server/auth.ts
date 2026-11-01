import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { GridFSBucket, MongoClient } from "mongodb";
import type { EventJoinRecord, EventRecord } from "./events.js";

function requireEnvironment(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env.local and configure it.`,
    );
  }

  return value;
}

const secret = requireEnvironment(
  "BETTER_AUTH_SECRET",
  process.env.BETTER_AUTH_SECRET,
);

if (secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long.");
}

export const frontendOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const mongoUri = requireEnvironment(
  "MONGODB_URI",
  process.env.MONGODB_URI,
);
const databaseName = requireEnvironment(
  "MONGODB_DATABASE",
  process.env.MONGODB_DATABASE,
);
export const mongoClient = new MongoClient(mongoUri);
const database = mongoClient.db(databaseName);
export const eventsCollection = database.collection<EventRecord>("events");
export const eventJoinsCollection =
  database.collection<EventJoinRecord>("eventJoins");
export const eventImagesBucket = new GridFSBucket(database, {
  bucketName: "eventImages",
});
let mongoConnection: Promise<MongoClient> | undefined;
let eventJoinsIndex: Promise<string> | undefined;

export function connectMongo() {
  mongoConnection ??= mongoClient.connect().catch((error: unknown) => {
    mongoConnection = undefined;
    throw error;
  });

  return mongoConnection;
}

export function ensureEventJoinsIndex() {
  eventJoinsIndex ??= eventJoinsCollection
    .createIndex({ eventId: 1, userId: 1 }, { unique: true })
    .catch((error: unknown) => {
      eventJoinsIndex = undefined;
      throw error;
    });

  return eventJoinsIndex;
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  appName: "EventMatrix",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret,
  trustedOrigins: frontendOrigins,
  database: mongodbAdapter(database),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },
  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
    }),
  ],
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        },
      }
    : {}),
});
