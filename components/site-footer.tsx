import Link from "next/link";
import BrandLogo from "@/components/brand-logo";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Upcoming events", href: "/events" },
  { label: "Create an event", href: "/create-event" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer text-white">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-12 sm:px-8 sm:pt-14 lg:px-10">
        <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.9fr] lg:gap-16">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="EventMatrix home"
              className="inline-flex rounded-xl bg-white px-3 py-2"
            >
              <BrandLogo className="w-40" priority={false} />
            </Link>
            <p className="mt-5 text-sm leading-7 text-white/60">
              A little time, a helping hand, a stronger neighborhood. Find
              community events and meet the people making good things happen
              nearby.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-sm font-bold text-white">Explore</h2>
            <ul className="mt-4 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition hover:text-violet-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-bold text-white">Our purpose</h2>
            <p className="mt-4 text-sm leading-7 text-white/55">
              Helping neighbors turn shared care into local action, one event
              at a time.
            </p>
            <Link
              href="/#newsletter"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-200 transition hover:text-cyan-200"
            >
              Get community updates
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© EventMatrix. Built for stronger communities.</p>
          <p>Show up for your neighborhood.</p>
        </div>
      </div>
    </footer>
  );
}
