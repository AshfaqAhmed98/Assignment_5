"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EventCreatedNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isVisible = searchParams.get("created") === "1";

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.replace("/events", { scroll: false });
    }, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [isVisible, router]);

  if (!isVisible) {
    return null;
  }

  return (
    <p
      role="status"
      className="event-created-notice mb-6 rounded-xl border px-4 py-3 text-sm font-medium"
    >
      Event created successfully.
    </p>
  );
}
