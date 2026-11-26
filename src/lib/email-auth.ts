import { getMockSmsCode, isMockSms } from "./settings";

/** Email OTP fallback when SMS/Mobizon unavailable. */
export async function sendAuthEmail(email: string, code: string) {
  const subject = "CoCo's — код входа";
  const text = `Ваш код: ${code}. Действует 10 минут.`;

  if (isMockSms() || !process.env.RESEND_API_KEY) {
    console.info("[email:mock]", email, text);
    return { ok: true as const, provider: "mock" as const };
  }

  const from = process.env.EMAIL_FROM || "CoCo's <noreply@cocos.kz>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [email], subject, text }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email:resend]", err);
    return { ok: false as const, provider: "resend" as const, error: err };
  }

  return { ok: true as const, provider: "resend" as const };
}

export function getAuthMode(): "sms" | "email" {
  const mode = (process.env.AUTH_MODE || "sms").toLowerCase();
  if (mode === "email") return "email";
  // Prefer email if Mobizon not configured and AUTH_MODE not forced sms
  if (!process.env.MOBIZON_API_KEY && process.env.AUTH_MODE !== "sms") {
    return process.env.AUTH_FALLBACK_EMAIL === "true" ? "email" : "sms";
  }
  return "sms";
}

export { getMockSmsCode };
