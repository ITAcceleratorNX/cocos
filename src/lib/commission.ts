import { CommissionStatus, KaspiOrderStatus, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export function calcCommissionAmount(orderTotal: number, rate: number | Prisma.Decimal) {
  const r = typeof rate === "number" ? rate : Number(rate);
  return Math.round((orderTotal * r) / 100);
}

export function commissionStatusFromOrder(status: KaspiOrderStatus): CommissionStatus {
  if (status === "COMPLETED") return "CONFIRMED";
  if (status === "CANCELLED" || status === "RETURNED") return "CANCELLED";
  return "PENDING";
}

export async function upsertCommissionForAttribution(orderId: string) {
  const order = await prisma.kaspiOrder.findUnique({
    where: { id: orderId },
    include: { attribution: true },
  });
  if (!order?.attribution) return null;

  const partner = await prisma.partner.findUnique({
    where: { id: order.attribution.partnerId },
  });
  if (!partner) return null;

  const rate = partner.commissionRate;
  const amountKzt = calcCommissionAmount(order.totalPrice, rate);
  const status = commissionStatusFromOrder(order.status);

  const existing = await prisma.commission.findUnique({ where: { orderId } });
  if (existing?.status === "PAID") {
    // Already paid — only cancel on return, never rewrite amount
    if (status === "CANCELLED") {
      return prisma.commission.update({
        where: { orderId },
        data: { status: "CANCELLED" },
      });
    }
    return existing;
  }

  return prisma.commission.upsert({
    where: { orderId },
    create: {
      orderId,
      partnerId: partner.id,
      rate,
      amountKzt,
      status,
    },
    update: {
      amountKzt,
      status,
    },
  });
}
