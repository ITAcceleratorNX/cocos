export function getAttributionPhoneDays() {
  return Number(process.env.ATTRIBUTION_PHONE_DAYS || 30);
}

export function getDefaultCommissionRate() {
  return Number(process.env.DEFAULT_COMMISSION_RATE || 15);
}

export function isMockSms() {
  return process.env.MOCK_SMS !== "false";
}

export function getMockSmsCode() {
  return process.env.MOCK_SMS_CODE || "000000";
}

function vercelHost() {
  const raw =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL ||
    "";
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Public site origin for shareable referral links. */
export function getAppUrl() {
  // Prefer explicit public URL when DNS/domain is not ready (e.g. VPS IP)
  const publicUrl = (process.env.PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
  if (publicUrl) return publicUrl;

  const configured = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
  const host = vercelHost();

  // cocos.kz is configured, but DNS may still point away from Vercel — prefer live deploy host
  if (configured.includes("cocos.kz") && host) {
    return `https://${host}`;
  }
  if (configured) return configured;
  if (host) return `https://${host}`;
  return "http://localhost:3000";
}
