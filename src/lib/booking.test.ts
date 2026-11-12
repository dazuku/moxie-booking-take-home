import { describe, expect, it } from "vitest";
import { buildBooking } from "./booking";
import type { Practice } from "./practices";

const practice: Practice = {
  slug: "gold-spa",
  name: "Gold Spa",
  logoUrl: "/logo.svg",
  addressLines: [],
  email: "goldspa@gmail.com",
  phone: "+11 123 4567 222",
  cancellationFeeCents: 5000,
  selectedServices: [
    { id: "botox-1", name: "Botox", durationMinutes: 45, priceCents: 20000 },
    { id: "botox-2", name: "Botox", durationMinutes: 45, priceCents: 20000 },
  ],
};

describe("buildBooking", () => {
  it("combines the practice, the services, the patient and the card into one booking", () => {
    const booking = buildBooking({
      practice,
      contact: { fullName: "Jane Doe", email: "jane@example.com", phone: "+16195550123", visitReason: "" },
      payment: { cardNumber: "4242424242424242", expiry: "12/27", cvv: "123", zip: "92108", acceptPolicy: true },
      bookedAt: new Date("2026-11-12T15:30:00.000Z"),
    });

    expect(booking).toEqual({
      practice: { slug: "gold-spa", name: "Gold Spa" },
      services: [
        { id: "botox-1", name: "Botox", durationMinutes: 45, priceCents: 20000 },
        { id: "botox-2", name: "Botox", durationMinutes: 45, priceCents: 20000 },
      ],
      totalCents: 40000,
      patient: { fullName: "Jane Doe", email: "jane@example.com", phone: "+16195550123", visitReason: "" },
      payment: { cardNumber: "4242424242424242", expiry: "12/27", cvv: "123", zip: "92108" },
      acceptedCancellationPolicy: true,
      bookedAt: "2026-11-12T15:30:00.000Z",
    });
  });
});
