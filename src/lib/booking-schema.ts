import { z } from "zod";

/**
 * US numbers only: 10 digits, optionally prefixed with the +1 country code.
 * Separators patients commonly type ( ) - . and spaces are allowed.
 * Returns the number in E.164 (+16195550123) so SMS and calling providers
 * can use it as is, or null when it is not a US number.
 */
export function toUsE164(input: string): string | null {
  if (!/^[\d\s().+-]+$/.test(input)) return null;
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

/** +16195550123 -> (619) 555-0123, for showing a stored number back to the patient. */
export function formatUsPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "").slice(-10);
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const VISIT_REASON_MAX = 500;

export const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .pipe(z.email("Enter a valid email address, like name@example.com")),
  phone: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const e164 = toUsE164(value);
      if (!e164) {
        ctx.addIssue({ code: "custom", message: "Enter a 10-digit US phone number" });
        return z.NEVER;
      }
      return e164;
    }),
  visitReason: z
    .string()
    .trim()
    .max(VISIT_REASON_MAX, `Keep the visit reason under ${VISIT_REASON_MAX} characters`),
});

/** What the patient types in the form. */
export type ContactFormValues = z.input<typeof contactSchema>;
/** What the form hands to the next step, after trimming and normalising. */
export type ContactDetails = z.output<typeof contactSchema>;
