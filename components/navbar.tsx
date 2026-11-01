"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import BrandLogo from "@/components/brand-logo";

type NavbarUser = {
  displayName: string;
  email?: string;
  imageUrl?: string;
};

type NavbarProps =
  | { user: NavbarUser; onLogout: () => void }
  | { user?: null; onLogout?: never };

export default function Navbar({ user = null, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const isEventsPage = pathname.startsWith("/events");
  const initials =
    user?.displayName
      .split(" ")
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

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
            aria-current={isEventsPage ? "page" : undefined}
            className={`group flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 ${
              isEventsPage
                ? "bg-gradient-to-r from-violet-500/25 via-fuchsia-500/20 to-cyan-400/20 text-white shadow-[0_0_18px_rgba(168,85,247,0.18)]"
                : "text-white/65 hover:bg-gradient-to-r hover:from-violet-500/25 hover:via-fuchsia-500/20 hover:to-cyan-400/20 hover:text-white hover:shadow-[0_0_18px_rgba(168,85,247,0.18)]"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className={
                isEventsPage
                  ? "size-[17px] text-[#ff6874]"
                  : "size-[17px] transition-colors group-hover:text-cyan-200"
              }
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
          {user ? (
            <>
              <details className="group relative">
                <summary
                  aria-label={`Open ${user.displayName}'s profile menu`}
                  title={user.displayName}
                  className="relative flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-violet-400 via-fuchsia-500 to-cyan-400 p-0.5 shadow-[0_0_18px_rgba(168,85,247,0.3)] outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#19191b] [&::-webkit-details-marker]:hidden"
                >
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
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
                  <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-lg border border-white/10 bg-[#211a34] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100">
                    {user.displayName}
                  </span>
                </summary>
                <div className="absolute right-0 top-full z-30 mt-3 w-64 rounded-2xl border border-white/10 bg-[#211a34] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                  <p className="text-xs font-medium text-white/55">Signed in as</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {user.displayName}
                  </p>
                  {user.email && (
                    <p className="mt-1 truncate text-xs text-white/60">{user.email}</p>
                  )}
                </div>
              </details>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/90 transition hover:border-rose-300/60 hover:bg-rose-500/15 hover:text-white sm:px-4 sm:text-sm"
              >
                Logout
              </button>
            </>
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
        className="border-t border-white/[0.07] px-4 py-2 md:hidden"
      >
        <Link
          href="/events"
          aria-current={isEventsPage ? "page" : undefined}
          className={`group mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            isEventsPage
              ? "bg-gradient-to-r from-violet-500/25 via-fuchsia-500/20 to-cyan-400/20 text-white shadow-[0_0_14px_rgba(168,85,247,0.16)]"
              : "text-white/65 hover:bg-gradient-to-r hover:from-violet-500/25 hover:via-fuchsia-500/20 hover:to-cyan-400/20 hover:text-white hover:shadow-[0_0_14px_rgba(168,85,247,0.16)]"
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="size-4 text-[#ff6874] transition-transform group-hover:scale-110"
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
    </header>
  );
}
