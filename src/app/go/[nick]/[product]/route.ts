import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PARTNER_COOKIE,
  PARTNER_COOKIE_DAYS,
  VISITOR_COOKIE,
  cookieMaxAgeDays,
} from "@/lib/cookies";
import { recordClick } from "@/lib/tracking";
import { randomBytes } from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ nick: string; product: string }> },
) {
  const { nick, product: productSlug } = await params;

  const partner = await prisma.partner.findUnique({
    where: { nick: nick.toLowerCase() },
  });
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
  });

  if (!partner || partner.status !== "APPROVED" || !product || !product.active) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  let cookieId = req.cookies.get(VISITOR_COOKIE)?.value;
  if (!cookieId) cookieId = randomBytes(16).toString("hex");

  await recordClick({
    partnerId: partner.id,
    productId: product.id,
    cookieId,
    userAgent: req.headers.get("user-agent"),
    referer: req.headers.get("referer"),
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    source: "go",
  });

  const res = NextResponse.redirect(product.kaspiUrl);
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
