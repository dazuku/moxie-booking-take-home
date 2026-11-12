const digitsOnly = (value: string) => value.replace(/\D/g, "");

/** "4242424242424242" -> "4242 4242 4242 4242". Card numbers are at most 19 digits. */
export function formatCardNumber(value: string): string {
  return digitsOnly(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** "1227" -> "12 / 27". The separator appears once the month is complete. */
export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
}

/**
 * Luhn checksum, which every card number satisfies. It catches most typos
 * (a wrong or swapped digit) before the number ever reaches the processor.
 */
export function passesLuhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** American Express numbers start with 34 or 37 and use a 4-digit security code. */
export function isAmex(digits: string): boolean {
  return /^3[47]/.test(digits);
}
