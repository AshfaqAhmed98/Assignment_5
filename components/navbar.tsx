"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import BrandLogo from "@/components/brand-logo";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const {
    data: session,
    error: sessionError,
    isPending: isSessionPending,
  } = authClient.useSession();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const user = session?.user;
  const initials =
    user?.name
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  const authError =
    logoutError ??
    (sessionError
      ? "Authentication service is unavailable. Check the API server and its configuration."
      : null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !profileMenuRef.current?.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        setLogoutError(error.message ?? "Unable to sign out.");
        return;
      }

      setLogoutError(null);
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the authentication server.",
      );
    }
  }

  return (
    <header className="navbar-gradient sticky top-0 z-50 border-b border-white/10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-7 md:h-[76px] lg:px-10">
        <Link
          href="/"
          className="group flex w-fit shrink-0 items-center rounded-2xl border border-violet-100/90 bg-gradient-to-br from-white via-[#faf7ff] to-[#eee7ff] px-2.5 py-2 shadow-[0_5px_22px_rgba(139,92,246,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(167,139,250,0.38)]"
          aria-label="EventMatrix home"
        >
          <BrandLogo className="w-36 max-[360px]:w-28 sm:w-44 lg:w-48" />
        </Link>

        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-white/[0.08] bg-white/[0.045] p-1 md:flex"
        >
          <Link
            href="/events"
            className="group flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-gradient-to-r hover:from-violet-500/25 hover:via-fuchsia-500/20 hover:to-cyan-400/20 hover:text-white"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-[17px] transition-colors group-hover:text-cyan-200"
            >
              <rect
                x="3.5"
                y="5"
                width="17"
                height="15.5"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            Upcoming Events
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {isSessionPending ? (
            <div
              aria-hidden="true"
              className="size-10 rounded-full border border-white/10 bg-white/[0.06]"
            />
          ) : user ? (
            <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  aria-label={`Open ${user.name}'s profile menu`}
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                  className="relative flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-violet-400 via-fuchsia-500 to-cyan-400 p-0.5 shadow-[0_0_18px_rgba(168,85,247,0.3)] outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#19191b]"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center rounded-full bg-[#211a34] text-xs font-bold text-white">
                      {initials}
                    </span>
                  )}
                </button>
              {isProfileMenuOpen && (
                <div
                  role="menu"
                  aria-label="Profile menu"
                  className="isolate absolute right-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-violet-200/25 bg-gradient-to-br from-[#292143] via-[#211b35] to-[#192333] p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.55),0_0_28px_rgba(139,92,246,0.2)] ring-1 ring-white/10 backdrop-blur-xl before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-violet-400 before:via-fuchsia-400 before:to-cyan-300"
                >
                  <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 -z-10 size-32 rounded-full bg-violet-400/15 blur-3xl" />
                  <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 -left-10 -z-10 size-32 rounded-full bg-cyan-400/10 blur-3xl" />
                  <div className="relative">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
                      <span className="size-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_8px_rgba(240,171,252,0.75)]" />
                      EventMatrix account
                    </p>
                    <p className="mt-2 truncate text-base font-bold text-white">
                      {user.name}
                    </p>
                    {user.email && (
                      <p className="mt-1 truncate text-xs text-violet-100/75">{user.email}</p>
                    )}
                  </div>
                  <div className="my-3 border-t border-violet-200/15" />
                  <div className="relative grid gap-1">
                    {[
                      ["Create Event", "/create-event", "from-violet-400 to-fuchsia-500"],
                      ["Manage Events", "/manage-events", "from-fuchsia-400 to-violet-500"],
                      ["Joined Events", "/joined-events", "from-cyan-300 to-blue-500"],
                    ].map(([label, href, accent], index) => (
                      <Link
                        key={href}
                        href={href}
                        role="menuitem"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="group/item flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-sm font-semibold text-violet-50 transition hover:border-violet-200/20 hover:bg-white/[0.07] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
                      >
                        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-xs font-black text-white shadow-[0_3px_12px_rgba(217,70,239,0.25)] transition group-hover/item:scale-105`}>
                          0{index + 1}
                        </span>
                        <span className="flex-1">{label}</span>
                        <span aria-hidden="true" className="text-base text-violet-200/60 transition group-hover/item:translate-x-0.5 group-hover/item:text-cyan-200">→</span>
                      </Link>
                    ))}
                  </div>
                  <div className="my-3 border-t border-violet-200/15" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="relative w-full rounded-xl border border-transparent px-3 py-2 text-left text-sm font-bold text-rose-200 transition hover:border-rose-300/20 hover:bg-rose-400/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(168,85,247,0.35)] transition duration-200 hover:-translate-y-0.5 hover:from-violet-500 hover:via-fuchsia-400 hover:to-rose-400 hover:shadow-[0_9px_26px_rgba(236,72,153,0.45)] max-[360px]:px-3 sm:px-7 sm:py-3"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Login
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    d="M4 10h12m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          )}
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="border-t border-white/[0.07] px-4 py-1.5 md:hidden"
      >
        <Link
          href="/events"
          className="mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="size-4"
          >
            <rect
              x="3.5"
              y="5"
              width="17"
              height="15.5"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          Upcoming Events
        </Link>
      </nav>
      {authError && (
        <p
          role="alert"
          className="absolute left-1/2 top-full z-50 mt-2 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-rose-300/20 bg-[#211a34] px-4 py-2 text-center text-xs font-medium text-rose-100 shadow-xl"
        >
          {authError}
        </p>
      )}
    </header>
  );
}
