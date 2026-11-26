import { prisma } from "./prisma";
import type { BonusKind } from "@prisma/client";

export async function applyBonus(params: {
  partnerId: string;
  amountKzt: number;
  kind: BonusKind;
  comment: string;
  adminActor: string;
  idempotencyKey?: string | null;
}) {
  if (!params.comment.trim()) {
    throw new Error("comment_required");
  }
  if (params.amountKzt === 0) {
    throw new Error("amount_zero");
  }
  if (params.kind === "CREDIT" && params.amountKzt < 0) {
    throw new Error("credit_must_be_positive");
  }
  if (params.kind === "PAYOUT" && params.amountKzt > 0) {
    // store payouts as negative delta for balance
    params = { ...params, amountKzt: -Math.abs(params.amountKzt) };
  }

  if (params.idempotencyKey) {
    const existing = await prisma.bonusLedger.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });
    if (existing) return { ledger: existing, deduped: true as const };
  }

  const result = await prisma.$transaction(async (tx) => {
    const partner = await tx.partner.findUniqueOrThrow({
      where: { id: params.partnerId },
    });
    const next = partner.bonusBalance + params.amountKzt;
    if (next < 0) throw new Error("insufficient_balance");

    const ledger = await tx.bonusLedger.create({
      data: {
        partnerId: params.partnerId,
        amountKzt: params.amountKzt,
        kind: params.kind,
        comment: params.comment.trim(),
        adminActor: params.adminActor,
        idempotencyKey: params.idempotencyKey || null,
      },
    });

    await tx.partner.update({
      where: { id: params.partnerId },
      data: { bonusBalance: next },
    });

    await tx.auditLog.create({
      data: {
        actor: params.adminActor,
        action: "bonus_" + params.kind.toLowerCase(),
        entity: "Partner",
        entityId: params.partnerId,
        meta: {
          amountKzt: params.amountKzt,
          comment: params.comment,
          ledgerId: ledger.id,
        },
      },
    });

    return ledger;
  });

  return { ledger: result, deduped: false as const };
}
