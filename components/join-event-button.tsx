"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { joinEvent } from "@/lib/event-api";

const buttonClassName =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.2)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200";

export default function JoinEventButton({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  async function handleJoin() {
    setMessage("");
    const token = getAccessToken();
    if (!token) {
      router.push(`/login?callbackURL=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsJoining(true);
    try {
      await joinEvent(token, eventId);
      setIsJoined(true);
      setMessage("You have joined this event.");
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Unable to join this event.",
      );
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleJoin}
        disabled={isJoining || isJoined}
        className={`${buttonClassName} disabled:cursor-wait disabled:opacity-60`}
      >
        {isJoining ? "Joining…" : isJoined ? "Joined" : "Join Event"}
      </button>
      {message && (
        <p
          role={isJoined ? "status" : "alert"}
          className="mt-3 text-xs leading-5 text-amber-100"
        >
          {message}
          {isJoined && (
            <>
              {" "}
              <Link href="/joined-events" className="underline">
                View joined events
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
