import { createHash } from "crypto";
import { prisma } from "./prisma";
import type { ReferralEventType } from "@prisma/client";

const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|wget|curl|python-requests|headless/i;

export function isBotUserAgent(ua?: string | null) {
  if (!ua) return false;
  return BOT_UA.test(ua);
}

export function hashIp(ip?: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function nextReferralCode() {
  const last = await prisma.partner.findFirst({
    where: { referralCode: { startsWith: "COCO" } },
    orderBy: { referralCode: "desc" },
    select: { referralCode: true },
  });
  let n = 1;
  if (last?.referralCode) {
    const parsed = Number(last.referralCode.replace(/\D/g, ""));
    if (!Number.isNaN(parsed)) n = parsed + 1;
  }
  return `COCO${String(n).padStart(3, "0")}`;
}

export async function recordReferralEvent(params: {
  referralCode: string;
  productId?: string | null;
  type: ReferralEventType;
  visitorId: string;
  userAgent?: string | null;
  referer?: string | null;
  source?: string | null;
  ip?: string | null;
  /** Logged-in client id — skip self-clicks */
  actorPartnerId?: string | null;
}) {
  if (isBotUserAgent(params.userAgent)) {
    return { ok: false as const, reason: "bot" };
  }

  const partner = await prisma.partner.findUnique({
    where: { referralCode: params.referralCode.toUpperCase() },
  });
  if (!partner || partner.status === "BLOCKED") {
    return { ok: false as const, reason: "invalid_ref" };
  }
  if (params.actorPartnerId && params.actorPartnerId === partner.id) {
    return { ok: false as const, reason: "self" };
  }

  // Technical dedupe: same visitor/partner/product/type within 3s
  const since = new Date(Date.now() - 3000);
  const dup = await prisma.referralEvent.findFirst({
    where: {
      partnerId: partner.id,
      visitorId: params.visitorId,
      type: params.type,
      productId: params.productId || null,
      createdAt: { gte: since },
    },
  });
  if (dup) return { ok: false as const, reason: "duplicate", partner };

  let isUnique = false;
  if (params.type === "OPEN") {
    const prior = await prisma.referralEvent.findFirst({
      where: {
        partnerId: partner.id,
        visitorId: params.visitorId,
        type: "OPEN",
      },
      select: { id: true },
    });
    isUnique = !prior;
  }

  const event = await prisma.referralEvent.create({
    data: {
      partnerId: partner.id,
      productId: params.productId || null,
      type: params.type,
      visitorId: params.visitorId,
      isUnique,
      userAgent: params.userAgent || null,
      referer: params.referer || null,
      source: params.source || null,
      ipHash: hashIp(params.ip),
    },
  });

  return { ok: true as const, event, partner, isUnique };
}

export function parseDateRange(from?: string | null, to?: string | null) {
  const where: { gte?: Date; lte?: Date } = {};
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) where.gte = d;
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      where.lte = d;
    }
  }
  return Object.keys(where).length ? where : undefined;
}

export async function referralStats(params: {
  partnerId?: string;
  productId?: string;
  from?: string | null;
  to?: string | null;
}) {
  const createdAt = parseDateRange(params.from, params.to);
  const base = {
    ...(params.partnerId ? { partnerId: params.partnerId } : {}),
    ...(params.productId ? { productId: params.productId } : {}),
    ...(createdAt ? { createdAt } : {}),
  };

  const [opens, uniqueOpens, kaspiClicks] = await Promise.all([
    prisma.referralEvent.count({ where: { ...base, type: "OPEN" } }),
    prisma.referralEvent.count({
      where: { ...base, type: "OPEN", isUnique: true },
    }),
    prisma.referralEvent.count({ where: { ...base, type: "KASPI_CLICK" } }),
  ]);

  return {
    opens,
    uniqueOpens,
    repeatOpens: Math.max(0, opens - uniqueOpens),
    kaspiClicks,
  };
}
