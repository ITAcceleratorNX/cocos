import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { issueAuthCode } from "@/lib/auth";
import { isMockSms } from "@/lib/settings";
import { authCodeMessage, sendSms } from "@/lib/sms";
import { sendAuthEmail } from "@/lib/email-auth";

const schema = z.object({
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const phone = parsed.data.phone ? normalizePhone(parsed.data.phone) : null;
  const email = parsed.data.email?.trim().toLowerCase() || null;

  if (!phone && !email) {
    return NextResponse.json({ error: "phone_or_email_required" }, { status: 400 });
  }
  if (parsed.data.phone && !phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const partner = await prisma.partner.findFirst({
    where: phone ? { phone } : { email: email! },
  });
  if (!partner) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (partner.status === "BLOCKED") {
    return NextResponse.json({ error: "blocked" }, { status: 403 });
  }

  const issued = await issueAuthCode({
    phone: phone || undefined,
    email: email || undefined,
    partnerId: partner.id,
  });

  let channel: "sms" | "email" = phone ? "sms" : "email";
  if (phone) {
    const sms = await sendSms(phone, authCodeMessage(issued.code));
    if (!sms.ok && email) {
      await sendAuthEmail(email, issued.code);
      channel = "email";
    } else if (!sms.ok && !isMockSms()) {
      // fall back to email on partner record
      if (partner.email) {
        await sendAuthEmail(partner.email, issued.code);
        channel = "email";
      }
    }
  } else if (email) {
    await sendAuthEmail(email, issued.code);
  }

  return NextResponse.json({
    ok: true,
    mock: isMockSms(),
    channel,
    code: issued.displayCode,
  });
}
