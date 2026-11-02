"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import BrandLogo from "@/components/brand-logo";
import { useAuth } from "@/lib/auth";

const publicLinks = [["Upcoming Events", "/events"]];
const protectedLinks = [
  [
    "Create Event",
    "/create-event",
    "M12 5v14m-7-7h14",
  ],
  [
    "Manage Events",
    "/manage-events",
    "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13ZM8 8h8M8 12h8M8 16h5",
  ],
  [
    "Joined Events",
    "/joined-events",
    "M16 19a4 4 0 0 0-8 0m12 0a4 4 0 0 0-3-3.87M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-5a3 3 0 0 1 0 6",
  ],
] as const;

export default function Navbar() {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDetailsElement>(null);

  function handleLogout() {
    profileMenuRef.current?.removeAttribute("open");
    logout();
    router.push("/");
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
          {publicLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="navbar-events-button whitespace-nowrap px-3 py-2.5 text-xs font-semibold lg:px-4 lg:text-sm"
            >
              <span className="relative z-10">{label}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="navbar-events-icon relative z-10 size-4 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          ))}
        </nav>

        {status === "authenticated" && user ? (
          <details ref={profileMenuRef} className="group relative ml-auto">
            <summary
              aria-label="Open profile menu"
              className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1 pl-1 pr-3 transition hover:border-violet-200/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200 [&::-webkit-details-marker]:hidden"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-sm font-bold text-white">
                {user.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="max-w-32 truncate text-sm font-semibold text-white/85">
                {user.name}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4 text-white/55 transition group-open:rotate-180"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>
            <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#171421] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
              <div className="border-b border-white/10 px-3 py-3">
                <p className="truncate text-sm font-bold text-white">{user.name}</p>
                <p className="mt-1 truncate text-xs text-white/50">{user.email}</p>
              </div>
              <nav
                aria-label="Profile navigation"
                className="profile-navigation relative py-2"
              >
                <span aria-hidden="true" className="profile-navigation-glider" />
                {protectedLinks.map(([label, href, icon]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => profileMenuRef.current?.removeAttribute("open")}
                    className="profile-navigation-link relative z-10 flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/65 transition hover:text-white"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="profile-navigation-icon size-5 shrink-0"
                    >
                      <path d={icon} />
                    </svg>
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="mt-1 border-t border-white/10 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-white/65 transition hover:bg-rose-300/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 shrink-0"
                  >
                    <path d="M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          </details>
        ) : status === "unauthenticated" ? (
          <Link
            href="/login"
            className="ml-auto rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(168,85,247,0.35)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 max-[360px]:px-3 sm:px-7 sm:py-3"
          >
            Login
          </Link>
        ) : (
          <span
            aria-label="Loading profile"
            className="ml-auto size-10 animate-pulse rounded-full bg-white/10"
          />
        )}
      </div>

      <nav
        aria-label="Mobile navigation"
        className="border-t border-white/[0.07] px-4 py-1.5 md:hidden"
      >
        <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-1">
          {publicLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="navbar-events-button flex px-3 py-1.5 text-xs font-semibold"
            >
              <span className="relative z-10">{label}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="navbar-events-icon relative z-10 size-4 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
