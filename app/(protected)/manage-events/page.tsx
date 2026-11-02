import ManageEventsPanel from "@/components/manage-events-panel";
import AuthGate from "@/components/auth-gate";

export default function ManageEventsPage() {
  return (
    <AuthGate>
      <ManageEventsPanel />
    </AuthGate>
  );
}
