import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { nextReferralCode } from "@/lib/referral";
import { getDefaultCommissionRate } from "@/lib/settings";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  city: z.string().min(2).max(80).optional(),
  consent: z.literal(true),
});

function nickFromName(name: string, phone?: string | null) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "")
    .slice(0, 12) || "client";
  const latin = base
    .replace(/[а-яё]/gi, (ch) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
        з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
        ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[ch] || "";
    })
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12) || "client";
  const suffix = (phone || Date.now().toString()).slice(-4);
  return `${latin}${suffix}`.slice(0, 32);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const phone = parsed.data.phone ? normalizePhone(parsed.data.phone) : null;
  const email = parsed.data.email?.trim().toLowerCase() || null;

  if (!phone && !email) {
    return NextResponse.json({ error: "phone_or_email_required" }, { status: 400 });
  }
  if (parsed.data.phone && !phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const existing = await prisma.partner.findFirst({
    where: {
      OR: [
        ...(phone ? [{ phone }] : []),
        ...(email ? [{ email }] : []),
      ],
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: existing.phone === phone ? "phone_taken" : "email_taken" },
      { status: 409 },
    );
  }

  let nick = nickFromName(parsed.data.name, phone);
  const nickTaken = await prisma.partner.findUnique({ where: { nick } });
  if (nickTaken) nick = `${nick}${Math.floor(Math.random() * 90 + 10)}`;

  const referralCode = await nextReferralCode();

  const partner = await prisma.partner.create({
    data: {
      name: parsed.data.name.trim(),
      phone: phone || `email_${Date.now()}`,
      email,
      city: parsed.data.city?.trim(),
      nick,
      referralCode,
      status: "APPROVED",
      commissionRate: getDefaultCommissionRate(),
      agreedAt: new Date(),
      approvedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    client: {
      id: partner.id,
      referralCode: partner.referralCode,
      name: partner.name,
    },
  });
}
