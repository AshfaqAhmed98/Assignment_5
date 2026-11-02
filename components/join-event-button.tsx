"use client";

import { useState } from "react";

const buttonClassName =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.2)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200";

export default function JoinEventButton() {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowNotice(true)}
        className={buttonClassName}
      >
        Join Event
      </button>
      {showNotice && (
        <p role="status" className="mt-3 text-xs leading-5 text-amber-100">
          Event registration is not available yet, so your participation will
          not be saved.
        </p>
      )}
    </div>
  );
}
