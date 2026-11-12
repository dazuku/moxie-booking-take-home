import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { paymentSchema } from "./payment-schema";

const valid = {
  cardNumber: "4242 4242 4242 4242",
  expiry: "12 / 27",
  cvv: "123",
  zip: "92108",
  acceptPolicy: true,
};

type PaymentInput = typeof valid;

function errorFor<K extends keyof PaymentInput>(field: K, value: PaymentInput[K], base = valid) {
  const result = paymentSchema.safeParse({ ...base, [field]: value });
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-15T12:00:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("paymentSchema", () => {
  it("accepts a complete card and hands it on without formatting spaces", () => {
    expect(paymentSchema.parse(valid)).toEqual({
      cardNumber: "4242424242424242",
      expiry: "12/27",
      cvv: "123",
      zip: "92108",
      acceptPolicy: true,
    });
  });

  it("requires a card number that passes the checksum", () => {
    expect(errorFor("cardNumber", "")).toBe("Enter your card number");
    expect(errorFor("cardNumber", "4242 4242 4242 4241")).toBe("Check your card number, it doesn't look right");
    expect(errorFor("cardNumber", "4242 4242")).toBe("Check your card number, it doesn't look right");
  });

  it("requires an expiry date with a real month", () => {
    expect(errorFor("expiry", "")).toBe("Enter the expiry date");
    expect(errorFor("expiry", "13 / 27")).toBe("Enter the expiry date as MM / YY");
    expect(errorFor("expiry", "1 / 2")).toBe("Enter the expiry date as MM / YY");
  });

  it("accepts a card that expires this month and rejects one that already expired", () => {
    expect(errorFor("expiry", "11 / 26")).toBeUndefined();
    expect(errorFor("expiry", "10 / 26")).toBe("This card has expired");
  });

  it("asks for 3 security digits, or 4 for American Express", () => {
    expect(errorFor("cvv", "")).toBe("Enter the 3-digit security code");
    expect(errorFor("cvv", "1234")).toBe("Enter the 3-digit security code");

    const amex = { ...valid, cardNumber: "3782 822463 10005" };
    expect(errorFor("cvv", "123", amex)).toBe("Enter the 4-digit security code on the front of your card");
    expect(errorFor("cvv", "1234", amex)).toBeUndefined();
  });

  it("accepts a 5-digit ZIP or ZIP+4", () => {
    expect(errorFor("zip", "92108-1234")).toBeUndefined();
    expect(errorFor("zip", "")).toBe("Enter your billing ZIP code");
    expect(errorFor("zip", "9210")).toBe("Enter a 5-digit ZIP code");
  });

  it("requires the patient to accept the cancellation policy", () => {
    expect(errorFor("acceptPolicy", false)).toBe("Accept the cancellation policy to book");
  });
});

describe("paymentSchema, several mistakes at once", () => {
  it("still reports the security code when other fields are also wrong", () => {
    const result = paymentSchema.safeParse({ ...valid, cvv: "", acceptPolicy: false });
    const fields = result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
    expect(fields).toContain("cvv");
    expect(fields).toContain("acceptPolicy");
  });

  it("still reports the security code when the card number and expiry are wrong too", () => {
    const result = paymentSchema.safeParse({ ...valid, cardNumber: "", expiry: "13 / 27", cvv: "" });
    const fields = result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["cardNumber", "expiry", "cvv"]));
  });
});
