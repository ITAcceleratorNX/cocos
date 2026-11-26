import { NextResponse } from "next/server";
import { z } from "zod";
import { recordReferralEvent } from "@/lib/referral";
import {
  REF_CODE_COOKIE,
  VISITOR_COOKIE,
  PARTNER_COOKIE_DAYS,
  cookieMaxAgeDays,
  newToken,
} from "@/lib/cookies";
import { getPartnerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  ref: z.string().min(3).max(32),
  productSlug: z.string().min(1).max(80).optional(),
  source: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const getCookie = (name: string) => {
    const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    return m?.[1] ? decodeURIComponent(m[1]) : null;
  };

  let visitorId = getCookie(VISITOR_COOKIE);
  if (!visitorId) visitorId = newToken().slice(0, 24);

  const product = parsed.data.productSlug
    ? await prisma.product.findUnique({ where: { slug: parsed.data.productSlug } })
    : null;

  const session = await getPartnerSession().catch(() => null);

  const result = await recordReferralEvent({
    referralCode: parsed.data.ref,
    productId: product?.id,
    type: "OPEN",
    visitorId,
    userAgent: req.headers.get("user-agent"),
    referer: req.headers.get("referer"),
    source: parsed.data.source,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    actorPartnerId: session?.partnerId,
  });

  const res = NextResponse.json({
    ok: result.ok,
    reason: "reason" in result ? result.reason : undefined,
    isUnique: result.ok ? result.isUnique : undefined,
  });

  const maxAge = cookieMaxAgeDays(PARTNER_COOKIE_DAYS);
  res.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  if (result.ok || ("reason" in result && result.reason !== "invalid_ref")) {
    const code = parsed.data.ref.toUpperCase();
    res.cookies.set(REF_CODE_COOKIE, code, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
  }

  return res;
}
