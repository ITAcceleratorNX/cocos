import { createHash } from "crypto";
import { prisma } from "./prisma";

export async function recordClick(params: {
  partnerId: string;
  productId?: string | null;
  cookieId: string;
  userAgent?: string | null;
  referer?: string | null;
  ip?: string | null;
  source?: string | null;
}) {
  const ipHash = params.ip
    ? createHash("sha256").update(params.ip).digest("hex").slice(0, 32)
    : null;

  return prisma.click.create({
    data: {
      partnerId: params.partnerId,
      productId: params.productId || null,
      cookieId: params.cookieId,
      userAgent: params.userAgent || null,
      referer: params.referer || null,
      ipHash,
      source: params.source || null,
    },
  });
}
