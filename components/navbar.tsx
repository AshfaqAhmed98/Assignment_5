import Link from "next/link";
import BrandLogo from "@/components/brand-logo";

const pageLinks = [
  ["Upcoming Events", "/events"],
  ["Create Event", "/create-event"],
  ["Manage Events", "/manage-events"],
  ["Joined Events", "/joined-events"],
];

export default function Navbar() {
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
          {pageLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-full px-3 py-2.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white lg:px-4 lg:text-sm"
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="ml-auto rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(168,85,247,0.35)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 max-[360px]:px-3 sm:px-7 sm:py-3"
        >
          Login
        </Link>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="border-t border-white/[0.07] px-4 py-1.5 md:hidden"
      >
        <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-1">
          {pageLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
