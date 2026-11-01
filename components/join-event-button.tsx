"use client";

import Link from "next/link";
import { useState } from "react";

const buttonClassName =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.2)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-60";

export default function JoinEventButton({
  eventId,
  initiallyJoined,
  isAuthenticated,
}: {
  eventId: string;
  initiallyJoined: boolean;
  isAuthenticated: boolean;
}) {
  const [isJoined, setIsJoined] = useState(initiallyJoined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);

  async function joinEvent() {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
      });
      const result = (await response.json()) as {
        error?: string;
        joined?: boolean;
      };

      if (!response.ok) {
        setNeedsSignIn(response.status === 401);
        setErrorMessage(result.error ?? "Unable to join this event.");
        return;
      }

      setNeedsSignIn(false);
      setIsJoined(Boolean(result.joined));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isJoined) {
    return (
      <p
        role="status"
        className="rounded-xl border border-emerald-200/20 bg-emerald-300/10 px-4 py-3 text-center text-sm font-bold text-emerald-100"
      >
        You’ve joined this event
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?callbackURL=${encodeURIComponent(`/events/${eventId}`)}`}
        className={buttonClassName}
      >
        Join Event
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={joinEvent}
        disabled={isSubmitting}
        className={buttonClassName}
      >
        {isSubmitting ? "Joining…" : "Join Event"}
      </button>
      {errorMessage && (
        <p role="alert" className="mt-3 text-xs leading-5 text-rose-200">
          {errorMessage}
          {needsSignIn && (
            <>
              {" "}
              <Link
                href={`/login?callbackURL=${encodeURIComponent(`/events/${eventId}`)}`}
                className="font-bold underline underline-offset-2"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
