"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { getEventJoinStatus, joinEvent } from "@/lib/event-api";

const buttonClassName =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.2)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200";

export default function JoinEventButton({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isCheckingJoinStatus, setIsCheckingJoinStatus] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        const token = getAccessToken();
        return token
          ? getEventJoinStatus(token, eventId)
          : { joined: false, isOwner: false };
      })
      .then(({ joined, isOwner: ownsEvent }) => {
        if (active) {
          setIsJoined(joined);
          setIsOwner(ownsEvent);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to check your event registration.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsCheckingJoinStatus(false);
        }
      });

    return () => {
      active = false;
    };
  }, [eventId]);

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
      {isOwner ? (
        <div className="event-host-notice rounded-xl px-4 py-3">
          <p className="event-host-title text-sm font-bold">
            You’re hosting this event
          </p>
          <p className="event-host-description mt-1 text-xs leading-5">
            Event creators are not counted as attendees.
          </p>
          <Link
            href="/manage-events"
            className="event-host-link mt-3 inline-flex text-xs font-semibold underline underline-offset-4"
          >
            Manage your event
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleJoin}
          disabled={isJoining || isCheckingJoinStatus || isJoined}
          className={`${buttonClassName} ${
            isJoining || isCheckingJoinStatus
              ? "cursor-wait opacity-60"
              : isJoined
                ? "cursor-default opacity-75"
                : "hover:-translate-y-0.5 hover:brightness-110"
          }`}
        >
          {isCheckingJoinStatus
            ? "Checking…"
            : isJoining
              ? "Joining…"
              : isJoined
                ? "Joined"
                : "Join Event"}
        </button>
      )}
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
