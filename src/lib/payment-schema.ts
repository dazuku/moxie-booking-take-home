import { z } from "zod";
import { isAmex, passesLuhn } from "./card";

/** True if a card expiring at the end of MM/YY is still valid today. */
function notExpired(month: number, twoDigitYear: number): boolean {
  const now = new Date();
  const year = 2000 + twoDigitYear;
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export const paymentSchema = z
  .object({
    cardNumber: z
      .string()
      .transform((value) => value.replace(/\s/g, ""))
      .pipe(
        z
          .string()
          .min(1, "Enter your card number")
          .refine(
            (digits) => /^\d{13,19}$/.test(digits) && passesLuhn(digits),
            "Check your card number, it doesn't look right",
          ),
      ),
    expiry: z
      .string()
      .min(1, "Enter the expiry date")
      .transform((value, ctx) => {
        const match = value.replace(/\s/g, "").match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
        if (!match) {
          ctx.addIssue({ code: "custom", message: "Enter the expiry date as MM / YY" });
          return z.NEVER;
        }
        if (!notExpired(Number(match[1]), Number(match[2]))) {
          ctx.addIssue({ code: "custom", message: "This card has expired" });
          return z.NEVER;
        }
        return `${match[1]}/${match[2]}`;
      }),
    cvv: z.string(),
    zip: z
      .string()
      .trim()
      .min(1, "Enter your billing ZIP code")
      .regex(/^\d{5}(-\d{4})?$/, "Enter a 5-digit ZIP code"),
    acceptPolicy: z.boolean().refine((accepted) => accepted, "Accept the cancellation policy to book"),
  })
  // The security code length depends on the card, so it is checked against the
  // number. `when` makes it run even if other fields failed: by default Zod
  // skips object-level checks then, and the patient would not see a CVV error
  // until they had fixed everything else.
  .superRefine(
    ({ cardNumber, cvv }, ctx) => {
      const amex = isAmex(String(cardNumber ?? "").replace(/\s/g, ""));
      const expected = amex ? 4 : 3;
      if (!new RegExp(`^\\d{${expected}}$`).test(cvv)) {
        ctx.addIssue({
          code: "custom",
          path: ["cvv"],
          message: amex
            ? "Enter the 4-digit security code on the front of your card"
            : "Enter the 3-digit security code",
        });
      }
    },
    { when: () => true },
  );

/** What the patient types in the form. */
export type PaymentFormValues = z.input<typeof paymentSchema>;
/** What the form hands to the flow: spaces removed, expiry as MM/YY. */
export type PaymentDetails = z.output<typeof paymentSchema>;
