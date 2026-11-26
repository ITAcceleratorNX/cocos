import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordClick } from "@/lib/tracking";
import {
  PARTNER_COOKIE,
  PARTNER_COOKIE_DAYS,
  VISITOR_COOKIE,
  cookieMaxAgeDays,
} from "@/lib/cookies";
import { randomBytes } from "crypto";

const schema = z.object({
  nick: z.string().min(2),
  productSlug: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const partner = await prisma.partner.findUnique({
    where: { nick: parsed.data.nick.toLowerCase() },
  });
  if (!partner || partner.status !== "APPROVED") {
    return NextResponse.json({ error: "partner_unavailable" }, { status: 404 });
  }

  let productId: string | undefined;
  if (parsed.data.productSlug) {
    const product = await prisma.product.findUnique({
      where: { slug: parsed.data.productSlug },
    });
    productId = product?.id;
  }

  let cookieId = req.cookies.get(VISITOR_COOKIE)?.value;
  if (!cookieId) cookieId = randomBytes(16).toString("hex");

  await recordClick({
    partnerId: partner.id,
    productId,
    cookieId,
    userAgent: req.headers.get("user-agent"),
    referer: req.headers.get("referer"),
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    source: parsed.data.source || "page",
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_COOKIE, partner.nick, {
    maxAge: cookieMaxAgeDays(PARTNER_COOKIE_DAYS),
    path: "/",
    sameSite: "lax",
  });
  res.cookies.set(VISITOR_COOKIE, cookieId, {
    maxAge: cookieMaxAgeDays(PARTNER_COOKIE_DAYS),
    path: "/",
    sameSite: "lax",
  });
  return res;
}
