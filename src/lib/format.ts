const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** 20000 -> "$200", 19950 -> "$199.50". Whole dollars drop the cents, as in the design. */
export function formatPrice(cents: number): string {
  return usd.format(cents / 100).replace(/\.00$/, "");
}

/** 45 -> "45 mins". */
export function formatDuration(minutes: number): string {
  return `${minutes} mins`;
}
