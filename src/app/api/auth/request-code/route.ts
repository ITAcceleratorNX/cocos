import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { issueAuthCode } from "@/lib/auth";
import { isMockSms } from "@/lib/settings";

const schema = z.object({
  phone: z.string().min(10),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const partner = await prisma.partner.findUnique({ where: { phone } });
  if (!partner) {
    return NextResponse.json({ error: "partner_not_found" }, { status: 404 });
  }
  if (partner.status === "BLOCKED") {
    return NextResponse.json({ error: "blocked" }, { status: 403 });
  }

  const issued = await issueAuthCode(phone, partner.id);

  return NextResponse.json({
    ok: true,
    mock: isMockSms(),
    // Only return code in mock mode for local MVP
    code: isMockSms() ? issued.code : undefined,
  });
}
