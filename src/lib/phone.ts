/** Keep only digits; allow a single leading +. */
export function sanitizePhoneInput(input: string): string {
  const raw = input.replace(/[^\d+]/g, "");
  if (!raw) return "";
  if (raw.startsWith("+")) {
    return `+${raw.slice(1).replace(/\D/g, "").slice(0, 15)}`;
  }
  return raw.replace(/\D/g, "").slice(0, 15);
}

/** Normalize KZ phones to digits starting with 7XXXXXXXXXX */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("7")) return digits;
  if (digits.length === 10 && digits.startsWith("7")) return `7${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("0")) return `7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith("8")) return `7${digits.slice(1)}`;
  if (digits.length === 10) return `7${digits}`;
  return null;
}
