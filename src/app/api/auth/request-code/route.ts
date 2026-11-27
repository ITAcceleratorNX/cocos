import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { issueAuthCode } from "@/lib/auth";
import { isMockSms } from "@/lib/settings";
import { authCodeMessage, sendSms } from "@/lib/sms";

const schema = z.object({
  phone: z.string().min(10),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const partner = await prisma.partner.findFirst({ where: { phone } });
  if (!partner) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (partner.status === "BLOCKED") {
    return NextResponse.json({ error: "blocked" }, { status: 403 });
  }

  const issued = await issueAuthCode({
    phone,
    partnerId: partner.id,
  });

  const sms = await sendSms(phone, authCodeMessage(issued.code));
  if (!sms.ok) {
    return NextResponse.json(
      { error: "sms_failed", detail: sms.error },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    mock: isMockSms(),
    channel: "sms" as const,
    code: issued.displayCode,
  });
}
