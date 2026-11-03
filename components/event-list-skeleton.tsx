export default function EventListSkeleton({
  count = 6,
  layout = "grid",
}: {
  count?: number;
  layout?: "grid" | "rows";
}) {
  return (
    <div
      role="status"
      aria-label="Loading events"
      className={
        layout === "grid"
          ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          : "grid gap-4"
      }
    >
      <span className="sr-only">Loading events…</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={`event-list-skeleton animate-pulse overflow-hidden rounded-2xl ${
            layout === "rows"
              ? "grid sm:grid-cols-[220px_1fr]"
              : "flex flex-col"
          }`}
        >
          <div
            className={`event-list-skeleton-image ${
              layout === "rows" ? "aspect-[16/10]" : "aspect-[16/9]"
            }`}
          />
          <div className="flex flex-col gap-3 p-5">
            <div className="event-list-skeleton-line h-3 w-24 rounded-full" />
            <div className="event-list-skeleton-line h-5 w-3/4 rounded-full" />
            <div className="event-list-skeleton-line h-3 w-full rounded-full" />
            <div className="event-list-skeleton-line h-3 w-2/3 rounded-full" />
            <div className="mt-2 flex gap-3">
              <div className="event-list-skeleton-line h-8 w-24 rounded-full" />
              <div className="event-list-skeleton-line h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
