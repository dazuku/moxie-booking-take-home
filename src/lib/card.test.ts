import { describe, expect, it } from "vitest";
import { formatCardNumber, formatExpiry, isAmex, passesLuhn } from "./card";

describe("formatCardNumber", () => {
  it("groups digits in fours as the patient types", () => {
    expect(formatCardNumber("4242")).toBe("4242");
    expect(formatCardNumber("42424")).toBe("4242 4");
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
  });

  it("drops anything that is not a digit and stops at 19 digits", () => {
    expect(formatCardNumber("4242-42a42")).toBe("4242 4242");
    expect(formatCardNumber("1".repeat(25)).replace(/\s/g, "")).toHaveLength(19);
  });
});

describe("formatExpiry", () => {
  it("adds the separator once the month is typed", () => {
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("12")).toBe("12");
    expect(formatExpiry("122")).toBe("12 / 2");
    expect(formatExpiry("1227")).toBe("12 / 27");
  });

  it("keeps only four digits", () => {
    expect(formatExpiry("12/2799")).toBe("12 / 27");
  });
});

describe("passesLuhn", () => {
  it("accepts real test card numbers and rejects a one-digit typo", () => {
    expect(passesLuhn("4242424242424242")).toBe(true);
    expect(passesLuhn("378282246310005")).toBe(true);
    expect(passesLuhn("4242424242424241")).toBe(false);
  });
});

describe("isAmex", () => {
  it("recognises American Express by its 34 or 37 prefix", () => {
    expect(isAmex("378282246310005")).toBe(true);
    expect(isAmex("341111111111111")).toBe(true);
    expect(isAmex("4242424242424242")).toBe(false);
  });
});
