import type { ReactNode } from "react";

// Shared by the real page and its loading skeleton, so nothing jumps when the
// content streams in. Stacked below 1024px (phones, portrait tablets); two
// columns above.
export function BookingMain({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 md:px-8 md:py-8 lg:max-w-5xl">
      <h1 className="mb-4 text-center text-base font-bold lg:sr-only">Book appointment</h1>
      <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {children}
      </div>
    </main>
  );
}

export function BookingSkeleton() {
  return (
    <BookingMain>
      <div
        role="status"
        aria-label="Loading booking details"
        className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6"
      >
        <div className="size-16 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-20 w-full animate-pulse rounded bg-muted" />
      </div>
      <div aria-hidden className="flex flex-col gap-4 rounded-lg border bg-card p-6 md:p-8">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
      </div>
    </BookingMain>
  );
}
