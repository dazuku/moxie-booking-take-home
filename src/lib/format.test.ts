import { describe, expect, it } from "vitest";
import { formatDuration, formatPrice } from "./format";

describe("formatPrice", () => {
  it("shows whole dollars without cents, the way the design does", () => {
    expect(formatPrice(20000)).toBe("$200");
  });

  it("keeps cents when there are any", () => {
    expect(formatPrice(19950)).toBe("$199.50");
  });
});

describe("formatDuration", () => {
  it("shows minutes the way the design does", () => {
    expect(formatDuration(45)).toBe("45 mins");
  });
});
