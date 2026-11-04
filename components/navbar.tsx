"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import BrandLogo from "@/components/brand-logo";
import ThemeToggle from "@/components/theme-toggle";
import { useAuth, type AuthUser } from "@/lib/auth";

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

function ProfileAvatar({
  user,
  large = false,
}: {
  user: AuthUser;
  large?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const sizeClassName = large ? "size-14" : "size-10";
  const imageSize = large ? 56 : 40;

  return (
    <span className={`profile-avatar group/avatar relative flex ${sizeClassName} shrink-0 items-center justify-center overflow-visible rounded-full text-sm font-bold`}>
      <span className="profile-avatar-surface flex size-full items-center justify-center overflow-hidden rounded-full">
        {user.photoURL && !imageFailed ? (
          <Image
            src={user.photoURL}
            alt=""
            width={imageSize}
            height={imageSize}
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="size-full scale-[1.35] object-cover object-[center_24%]"
          />
        ) : (
          <span className="profile-avatar-initial" aria-hidden="true">
            {user.name.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      {!large && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-full z-[60] mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#171421] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover/avatar:opacity-100 group-focus-visible:opacity-100"
        >
          {user.name}
        </span>
      )}
    </span>
  );
}

export default function Navbar() {
  const {
    user,
    status,
    error,
    logout,
    retrySession,
  } = useAuth();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDetailsElement>(null);
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      await logout();
      profileMenuRef.current?.removeAttribute("open");
      router.push("/");
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to log out.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="navbar-gradient sticky top-0 z-50 border-b border-white/10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-7 md:h-[76px] lg:px-10">
        <Link
          href="/#banner"
          onClick={(event) => {
            if (window.location.pathname !== "/") return;

            event.preventDefault();
            if (window.location.hash !== "#banner") {
              window.history.replaceState(null, "", "#banner");
            }
            document.getElementById("banner")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
          className="group flex w-fit shrink-0 items-center rounded-2xl border border-violet-100/90 bg-gradient-to-br from-white via-[#faf7ff] to-[#eee7ff] px-2.5 py-2 shadow-[0_5px_22px_rgba(139,92,246,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(167,139,250,0.38)]"
          aria-label="EventMatrix home"
        >
          <BrandLogo className="w-[clamp(6rem,30vw,11rem)] lg:w-48" />
        </Link>

        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-white/[0.08] bg-white/[0.045] p-1 xl:flex"
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
          <div className="ml-auto flex items-center gap-[clamp(0.25rem,2vw,1rem)]">
          <div className="flex h-11 items-center">
            <ThemeToggle />
          </div>
          <details ref={profileMenuRef} className="group relative">
            <summary
              aria-label="Open profile menu"
              className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full bg-white/[0.06] py-1 pl-1 pr-2 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200 max-[400px]:gap-1 max-[400px]:pr-1 [&::-webkit-details-marker]:hidden sm:pr-3"
            >
              <ProfileAvatar key={user.photoURL || user.id} user={user} />
              <span className="hidden max-w-32 truncate text-sm font-semibold text-white/85 md:inline">
                {user.name}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4 text-white/55 transition group-open:rotate-180 max-[400px]:hidden"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>
            <div className="profile-card absolute right-0 top-full z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] overflow-hidden p-2">
              <div className="profile-card-heading relative z-10 flex items-center gap-3 px-3 py-4">
                <span className="profile-card-circle flex size-[4.5rem] shrink-0 items-center justify-center rounded-full p-1">
                  <ProfileAvatar key={`menu-${user.photoURL || user.id}`} user={user} large />
                </span>
                <div className="min-w-0">
                  <p className="profile-card-name truncate text-sm font-bold">{user.name}</p>
                  <p className="profile-card-email mt-1 truncate text-xs">{user.email}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
                    Profile
                  </p>
                </div>
              </div>
              <nav
                aria-label="Profile navigation"
                className="profile-navigation relative z-10 py-2"
              >
                <span aria-hidden="true" className="profile-navigation-glider" />
                {protectedLinks.map(([label, href, icon]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => profileMenuRef.current?.removeAttribute("open")}
                    className="profile-navigation-link relative z-10 flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition"
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
            </div>
          </details>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            aria-label="Log out"
            className="navbar-logout-button inline-flex h-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold max-[400px]:px-2 sm:px-3 disabled:cursor-wait disabled:opacity-60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 shrink-0"
            >
              <path d="M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>
            <span className="hidden sm:inline">
              {isLoggingOut ? "Logging out…" : "Log out"}
            </span>
          </button>
          </div>
        ) : status === "unauthenticated" ? (
          <div className="ml-auto flex items-center gap-[clamp(0.25rem,2vw,1rem)]">
            <div className="flex h-11 items-center">
              <ThemeToggle />
            </div>
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(168,85,247,0.35)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 max-[360px]:px-3 sm:px-7"
            >
              Login
            </Link>
          </div>
        ) : (
          <div
            role={status === "error" ? "alert" : "status"}
            className="ml-auto flex items-center gap-[clamp(0.25rem,2vw,1rem)]"
          >
            <div className="flex h-11 items-center">
              <ThemeToggle />
            </div>
            <span
              aria-label={
                status === "loading"
                  ? "Checking your sign-in status"
                  : error || "Sign-in is unavailable"
              }
              title={status === "error" ? error || undefined : undefined}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 text-xs font-medium text-white/70"
            >
              <span
                className={`size-2 rounded-full ${
                  status === "loading"
                    ? "animate-pulse bg-cyan-300"
                    : "bg-rose-300"
                }`}
              />
              <span className="hidden sm:inline">
                {status === "loading"
                  ? "Checking sign-in…"
                  : "Sign-in unavailable"}
              </span>
            </span>
            {status === "error" && (
              <button
                type="button"
                onClick={retrySession}
                className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {logoutError && (
        <p
          role="alert"
          className="mx-auto max-w-7xl px-4 pb-2 text-right text-xs text-rose-200 sm:px-7 lg:px-10"
        >
          {logoutError}
        </p>
      )}

      {status === "error" && error && (
        <p
          role="alert"
          className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-2 px-4 pb-2 text-right text-xs text-rose-200 sm:px-7 lg:px-10"
        >
          Sign-in check failed: {error}
          <button
            type="button"
            onClick={retrySession}
            className="font-bold underline underline-offset-2"
          >
            Retry
          </button>
        </p>
      )}

      <nav
        aria-label="Mobile navigation"
        className="border-t border-white/[0.07] px-4 py-1.5 xl:hidden"
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
