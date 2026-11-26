import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { createPartnerSession, safeEqual, verifySmsCode } from "@/lib/auth";

const schema = z.object({
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  code: z.string().min(4),
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

  const partner = await prisma.partner.findFirst({
    where: phone ? { phone } : { email: email! },
  });
  if (!partner) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const latest = await prisma.authCode.findFirst({
    where: {
      usedAt: null,
      expiresAt: { gt: new Date() },
      ...(phone ? { phone } : { email: email! }),
    },
    orderBy: { createdAt: "desc" },
  });

  const ok =
    verifySmsCode(parsed.data.code) ||
    (latest ? safeEqual(latest.code, parsed.data.code) : false);

  if (!ok) {
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  if (latest) {
    await prisma.authCode.update({
      where: { id: latest.id },
      data: { usedAt: new Date() },
    });
  }

  if (email && !partner.emailVerifiedAt) {
    await prisma.partner.update({
      where: { id: partner.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  await createPartnerSession(partner.id);

  return NextResponse.json({
    ok: true,
    client: {
      id: partner.id,
      referralCode: partner.referralCode,
      name: partner.name,
      status: partner.status,
    },
  });
}
