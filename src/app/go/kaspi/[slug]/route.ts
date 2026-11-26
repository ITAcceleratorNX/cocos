import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordReferralEvent } from "@/lib/referral";
import {
  REF_CODE_COOKIE,
  VISITOR_COOKIE,
  PARTNER_COOKIE_DAYS,
  cookieMaxAgeDays,
  newToken,
} from "@/lib/cookies";
import { getPartnerSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.active) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId) visitorId = newToken().slice(0, 24);

  const ref =
    req.nextUrl.searchParams.get("ref") ||
    req.cookies.get(REF_CODE_COOKIE)?.value ||
    "";

  const session = await getPartnerSession().catch(() => null);

  if (ref) {
    await recordReferralEvent({
      referralCode: ref,
      productId: product.id,
      type: "KASPI_CLICK",
      visitorId,
      userAgent: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
      source: "kaspi_button",
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      actorPartnerId: session?.partnerId,
    });
  }

  const res = NextResponse.redirect(product.kaspiUrl);
  const maxAge = cookieMaxAgeDays(PARTNER_COOKIE_DAYS);
  res.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  if (ref) {
    res.cookies.set(REF_CODE_COOKIE, ref.toUpperCase(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
  }
  return res;
}
