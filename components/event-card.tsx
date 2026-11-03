import Image from "next/image";
import Link from "next/link";
import type { PublicEvent } from "@/lib/events";

export type { PublicEvent } from "@/lib/events";

export default function EventCard({
  event,
  detailsHref,
  variant = "default",
}: {
  event: PublicEvent;
  detailsHref?: string | null;
  variant?: "default" | "spotlight" | "neon";
}) {
  const eventDate = new Date(event.eventDate);

  if (variant === "neon") {
    const card = (
      <article className="upcoming-event-card">
        <div className="upcoming-event-card__surface">
          <div className="upcoming-event-card__image">
            {event.thumbnailUrl ? (
              <Image
                src={event.thumbnailUrl}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="upcoming-event-card__image-content"
              />
            ) : (
              <span className="upcoming-event-card__image-placeholder">
                {event.type}
              </span>
            )}
            <span className="upcoming-event-card__type">{event.type}</span>
          </div>
          <div className="upcoming-event-card__content">
            <div>
              <p className="upcoming-event-card__eyebrow">Upcoming event</p>
              <h2 className="upcoming-event-card__title">{event.title}</h2>
              <p className="upcoming-event-card__description">
                {event.description}
              </p>
            </div>
            <div className="upcoming-event-card__details">
              <time dateTime={event.eventDate}>
                {eventDate.toLocaleDateString("en", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span>{event.location}</span>
            </div>
            <p className="upcoming-event-card__powered">
              <span>Powered by</span>
              <strong>EventMatrix</strong>
            </p>
          </div>
        </div>
      </article>
    );

    return detailsHref === null ? (
      card
    ) : (
      <Link
        href={detailsHref ?? `/events/${event.id}`}
        className="upcoming-event-card-link"
        aria-label={`View details for ${event.title}`}
      >
        {card}
      </Link>
    );
  }

  if (variant === "spotlight") {
    const details = [
      event.type,
      eventDate.toLocaleDateString("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      event.location,
      eventDate.toLocaleTimeString("en", {
        hour: "numeric",
        minute: "2-digit",
      }),
    ];

    const card = (
      <article className="homepage-event-card">
        <div className="homepage-event-card__image">
          {event.thumbnailUrl ? (
            <Image
              src={event.thumbnailUrl}
              alt={event.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="homepage-event-card__image-content"
            />
          ) : (
            <span className="homepage-event-card__image-placeholder">
              {event.type}
            </span>
          )}
        </div>
        <div className="homepage-event-card__content">
          <div className="homepage-event-card__heading">
            <span className="homepage-event-card__eyebrow">Community event</span>
            <h3 className="homepage-event-card__title">{event.title}</h3>
            <p className="homepage-event-card__description">
              {event.description}
            </p>
          </div>
          <hr className="homepage-event-card__divider" />
          <ul className="homepage-event-card__details">
            {details.map((detail, index) => (
              <li key={`${index}-${detail}`} className="homepage-event-card__detail">
                <span aria-hidden="true" className="homepage-event-card__check">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="homepage-event-card__detail-text">{detail}</span>
              </li>
            ))}
          </ul>
          {detailsHref === null ? (
            <p className="homepage-event-card__unavailable">
              This event is no longer available.
            </p>
          ) : (
            <span className="homepage-event-card__button">
              View event details
              <span aria-hidden="true">→</span>
            </span>
          )}
        </div>
      </article>
    );

    return detailsHref === null ? (
      card
    ) : (
      <Link
        href={detailsHref ?? `/events/${event.id}`}
        className="homepage-event-card-link"
        aria-label={`View details for ${event.title}`}
      >
        {card}
      </Link>
    );
  }

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
