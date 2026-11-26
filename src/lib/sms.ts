import { getMockSmsCode, isMockSms } from "./settings";

/**
 * SMS delivery. Mobizon when MOBIZON_API_KEY is set; otherwise mock (dev/MVP).
 * Credentials: ask Damir / Жубаныш. Docs: https://mobizon.kz
 */
export async function sendSms(phone: string, message: string) {
  if (isMockSms() || !process.env.MOBIZON_API_KEY) {
    console.info("[sms:mock]", phone, message);
    return { ok: true as const, provider: "mock" as const };
  }

  const apiKey = process.env.MOBIZON_API_KEY;
  const base =
    process.env.MOBIZON_API_BASE || "https://api.mobizon.kz/service";
  const recipient = phone.startsWith("7") ? phone : phone.replace(/\D/g, "");

  const body = new URLSearchParams({
    apiKey,
    recipient,
    text: message,
  });

  const res = await fetch(`${base}/message/sendSms`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json().catch(() => null)) as {
    code?: number;
    message?: string;
    data?: unknown;
  } | null;

  if (!res.ok || (data && data.code !== 0 && data.code !== undefined)) {
    console.error("[sms:mobizon]", data);
    return {
      ok: false as const,
      provider: "mobizon" as const,
      error: data?.message || `http_${res.status}`,
    };
  }

  return { ok: true as const, provider: "mobizon" as const, data };
}

export function authCodeMessage(code: string) {
  return `CoCo's: код входа ${code}`;
}

export { getMockSmsCode, isMockSms };
