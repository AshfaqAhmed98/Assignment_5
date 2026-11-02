import CreateEventForm from "@/components/create-event-form";
import AuthGate from "@/components/auth-gate";

export default function CreateEventPage() {
  return (
    <AuthGate>
      <CreateEventForm />
    </AuthGate>
  );
}
