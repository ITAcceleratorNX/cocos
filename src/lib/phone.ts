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
