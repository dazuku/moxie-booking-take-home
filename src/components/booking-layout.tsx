import type { ReactNode } from "react";

// Shared by the real page and its loading skeleton, so nothing jumps when the
// content streams in. Stacked below 1024px (phones, portrait tablets), in the
// order the children come in. From 1024px, two columns: children placed with
// the classes below.
export const placement = {
  practice: "lg:col-start-1 lg:row-start-1",
  services: "lg:col-start-1 lg:row-start-2",
  step: "lg:col-start-2 lg:row-start-1 lg:row-span-2",
};

const grids = {
  columns:
    "grid items-start gap-4 md:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-[auto_1fr]",
  // Confirmation: one centred column at every size, as in the Figma frames.
  single: "mx-auto grid w-full max-w-lg gap-4 md:gap-6",
};

export function BookingMain({
  layout = "columns",
  children,
}: {
  layout?: keyof typeof grids;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 md:px-8 md:py-8 lg:max-w-5xl">
      <h1 className="mb-4 text-center text-base font-bold lg:sr-only">Book appointment</h1>
      <div className={grids[layout]}>{children}</div>
    </main>
  );
}

export function BookingSkeleton() {
  return (
    <BookingMain>
      <div
        role="status"
        aria-label="Loading booking details"
        className={`flex flex-col items-center gap-4 rounded-lg border bg-card p-6 ${placement.practice}`}
      >
        <div className="size-16 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-20 w-full animate-pulse rounded bg-muted" />
      </div>
      <div
        aria-hidden
        className={`flex flex-col gap-4 rounded-lg border bg-card p-6 md:p-8 ${placement.step}`}
      >
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
      </div>
    </BookingMain>
  );
}
