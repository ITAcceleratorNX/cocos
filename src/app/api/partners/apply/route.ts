import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { getDefaultCommissionRate } from "@/lib/settings";
import { nextReferralCode } from "@/lib/referral";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(10),
  city: z.string().min(2).max(80).optional(),
  nick: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_]+$/i, "nick_latin")
    .optional(),
  email: z.string().email().optional(),
  instagram: z.string().max(120).optional(),
  tiktok: z.string().max(120).optional(),
  consent: z.literal(true),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const email = parsed.data.email?.trim().toLowerCase();
  const nick =
    parsed.data.nick?.toLowerCase() ||
    `c${phone.slice(-8)}`;

  const existing = await prisma.partner.findFirst({
    where: {
      OR: [{ phone }, { nick }, ...(email ? [{ email }] : [])],
    },
  });
  if (existing) {
    const error =
      existing.phone === phone
        ? "phone_taken"
        : existing.email === email
          ? "email_taken"
          : "nick_taken";
    return NextResponse.json({ error }, { status: 409 });
  }

  const referralCode = await nextReferralCode();

  const partner = await prisma.partner.create({
    data: {
      name: parsed.data.name.trim(),
      phone,
      email,
      city: parsed.data.city?.trim(),
      nick,
      referralCode,
      instagram: parsed.data.instagram?.trim(),
      tiktok: parsed.data.tiktok?.trim(),
      status: "APPROVED",
      commissionRate: getDefaultCommissionRate(),
      agreedAt: new Date(),
      approvedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    partner: {
      id: partner.id,
      nick: partner.nick,
      referralCode: partner.referralCode,
      status: partner.status,
    },
    client: {
      id: partner.id,
      referralCode: partner.referralCode,
      name: partner.name,
    },
  });
}
