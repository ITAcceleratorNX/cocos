import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { createPartnerSession, safeEqual, verifySmsCode } from "@/lib/auth";

const schema = z.object({
  phone: z.string().min(10),
  code: z.string().min(4),
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

  const partner = await prisma.partner.findUnique({ where: { phone } });
  if (!partner) {
    return NextResponse.json({ error: "partner_not_found" }, { status: 404 });
  }

  const latest = await prisma.authCode.findFirst({
    where: { phone, usedAt: null, expiresAt: { gt: new Date() } },
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

  await createPartnerSession(partner.id);

  return NextResponse.json({
    ok: true,
    partner: {
      id: partner.id,
      nick: partner.nick,
      name: partner.name,
      status: partner.status,
    },
  });
}
