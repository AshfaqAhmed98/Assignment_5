import Image from "next/image";
import Link from "next/link";
import type { PublicEvent } from "@/lib/events";

export type { PublicEvent } from "@/lib/events";

export default function EventCard({
  event,
  detailsHref,
}: {
  event: PublicEvent;
  detailsHref?: string | null;
}) {
  const eventDate = new Date(event.eventDate);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-400/25 via-fuchsia-500/10 to-transparent p-px transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="flex h-full flex-col rounded-[15px] bg-[#171421]/95 p-5 sm:p-6">
        <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <Image
            src={event.thumbnailUrl}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-300/10 px-3 py-1 text-[0.65rem] font-semibold tracking-wide text-fuchsia-100">
            {event.type}
          </span>
          <time
            dateTime={event.eventDate}
            className="text-xs font-bold tracking-[0.12em] text-white/75"
          >
            {eventDate
              .toLocaleDateString("en", {
                month: "short",
                day: "2-digit",
              })
              .toUpperCase()}
          </time>
        </div>
        <h3 className="mt-5 text-lg font-bold tracking-tight text-white sm:text-xl">
          {event.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-white/65">
          {event.description}
        </p>
        <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-white/65">
          <p className="flex items-center gap-2">
            <span aria-hidden="true" className="text-fuchsia-200">
              ◆
            </span>
            {event.location}
          </p>
          <p className="flex items-center gap-2">
            <span aria-hidden="true" className="text-cyan-200">
              ◷
            </span>
            {eventDate.toLocaleString("en", {
              weekday: "long",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        {detailsHref === null ? (
          <p className="mt-5 text-center text-xs text-white/40">
            This event is no longer available.
          </p>
        ) : (
          <Link
            href={detailsHref ?? `/events/${event.id}`}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-violet-200/25 bg-violet-300/10 px-5 text-sm font-bold text-violet-100 transition hover:border-fuchsia-200/50 hover:bg-fuchsia-300/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200"
          >
            View Event
          </Link>
        )}
      </div>
    </article>
  );
}
