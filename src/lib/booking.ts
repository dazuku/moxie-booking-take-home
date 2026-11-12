import type { ContactDetails } from "./booking-schema";
import type { PaymentDetails } from "./payment-schema";
import type { Practice } from "./practices";

/**
 * The booking the patient submits. There is no API in this exercise, so it
 * is printed to the console instead of being sent anywhere.
 */
export function buildBooking({
  practice,
  contact,
  payment,
  bookedAt,
}: {
  practice: Practice;
  contact: ContactDetails;
  payment: PaymentDetails;
  bookedAt: Date;
}) {
  const { acceptPolicy, ...card } = payment;
  return {
    practice: { slug: practice.slug, name: practice.name },
    services: practice.selectedServices,
    totalCents: practice.selectedServices.reduce((sum, service) => sum + service.priceCents, 0),
    patient: contact,
    payment: card,
    acceptedCancellationPolicy: acceptPolicy,
    bookedAt: bookedAt.toISOString(),
  };
}

export type Booking = ReturnType<typeof buildBooking>;
