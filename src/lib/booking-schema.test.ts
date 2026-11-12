import { describe, expect, it } from "vitest";
import { contactSchema, formatUsPhone } from "./booking-schema";

const valid = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "(619) 555-0123",
  visitReason: "",
};

function errorFor(field: keyof typeof valid, value: string) {
  const result = contactSchema.safeParse({ ...valid, [field]: value });
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe("contactSchema", () => {
  it("accepts a complete contact and leaves the visit reason optional", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("trims the name and email the patient typed", () => {
    const data = contactSchema.parse({ ...valid, fullName: "  Jane Doe ", email: " jane@example.com " });
    expect(data.fullName).toBe("Jane Doe");
    expect(data.email).toBe("jane@example.com");
  });

  it("requires a full name, but no minimum length", () => {
    expect(errorFor("fullName", "")).toBe("Enter your full name");
    expect(errorFor("fullName", "   ")).toBe("Enter your full name");
    expect(errorFor("fullName", "J")).toBeUndefined();
  });

  it("requires a valid email address", () => {
    expect(errorFor("email", "")).toBe("Enter your email address");
    expect(errorFor("email", "jane@")).toBe("Enter a valid email address, like name@example.com");
  });

  it.each(["(619) 555-0123", "619-555-0123", "619.555.0123", "6195550123", "+1 619 555 0123"])(
    "accepts the US phone format %s and stores it as +16195550123",
    (phone) => {
      expect(contactSchema.parse({ ...valid, phone }).phone).toBe("+16195550123");
    },
  );

  it.each(["", "555-0123", "+44 20 7946 0958", "619-555-012a"])(
    "rejects %j as a US phone number",
    (phone) => {
      expect(errorFor("phone", phone)).toMatch(/phone number/);
    },
  );

  it("limits the visit reason to 500 characters", () => {
    expect(errorFor("visitReason", "a".repeat(500))).toBeUndefined();
    expect(errorFor("visitReason", "a".repeat(501))).toBe("Keep the visit reason under 500 characters");
  });
});

describe("formatUsPhone", () => {
  it("shows a stored number the way US patients write it", () => {
    expect(formatUsPhone("+16195550123")).toBe("(619) 555-0123");
  });
});
