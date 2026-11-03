export default function EventDetailsSkeleton() {
  return (
    <main className="flex-1 bg-[#0b0b12] px-4 py-8 text-white sm:px-6 sm:py-12 lg:px-8">
      <article
        role="status"
        aria-label="Loading event details"
        className="event-list-skeleton mx-auto max-w-5xl animate-pulse overflow-hidden rounded-3xl"
      >
        <span className="sr-only">Loading event details…</span>
        <div aria-hidden="true" className="event-list-skeleton-image aspect-[16/8] min-h-56 sm:min-h-80" />
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_280px]">
          <div aria-hidden="true" className="flex flex-col gap-4">
            <div className="event-list-skeleton-line h-4 w-32 rounded-full" />
            <div className="event-list-skeleton-line h-9 w-3/4 rounded-full" />
            <div className="event-list-skeleton-line h-4 w-full rounded-full" />
            <div className="event-list-skeleton-line h-4 w-5/6 rounded-full" />
            <div className="event-list-skeleton-line mt-5 h-24 w-full rounded-2xl" />
          </div>
          <aside
            aria-hidden="true"
            className="event-list-skeleton flex flex-col gap-4 rounded-2xl p-5"
          >
            <div className="event-list-skeleton-line h-5 w-2/3 rounded-full" />
            <div className="event-list-skeleton-line h-4 w-full rounded-full" />
            <div className="event-list-skeleton-line h-12 w-full rounded-full" />
          </aside>
        </div>
      </article>
    </main>
  );
}
