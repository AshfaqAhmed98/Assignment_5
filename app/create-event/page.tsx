import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CreateEventForm from "@/components/create-event-form";
import { auth, connectMongo } from "@/server/auth";

export const instant = false;

export default async function CreateEventPage() {
  await connectMongo();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return <CreateEventForm />;
}
