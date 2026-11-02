import ManageEventsPanel, {
  type ManagedEvent,
} from "@/components/manage-events-panel";
import AuthGate from "@/components/auth-gate";
import { sampleEvents } from "@/lib/events";

export default function ManageEventsPage() {
  const managedEvents: ManagedEvent[] = sampleEvents.slice(0, 2);
  return (
    <AuthGate>
      <ManageEventsPanel initialEvents={managedEvents} />
    </AuthGate>
  );
}
