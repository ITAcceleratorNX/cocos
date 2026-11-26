import { prisma } from "./prisma";
import { getAttributionPhoneDays } from "./settings";
import { upsertCommissionForAttribution } from "./commission";

/** Stage 1 helper: attribute order by phone lead (last click within window) */
export async function attributeOrderByPhone(orderId: string) {
  const order = await prisma.kaspiOrder.findUnique({ where: { id: orderId } });
  if (!order?.customerPhone) return { ok: false as const, reason: "no_phone" };
  if (await prisma.attribution.findUnique({ where: { orderId } })) {
    return { ok: false as const, reason: "already_attributed" };
  }

  const since = new Date(
    Date.now() - getAttributionPhoneDays() * 24 * 60 * 60 * 1000,
  );

  const lead = await prisma.lead.findFirst({
    where: {
      phone: order.customerPhone,
      createdAt: { gte: since, lte: order.orderedAt },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!lead) return { ok: false as const, reason: "no_lead" };

  const attribution = await prisma.attribution.create({
    data: {
      orderId,
      partnerId: lead.partnerId,
      method: "PHONE",
      confidence: "HIGH",
      note: `Lead ${lead.id}`,
    },
  });

  await upsertCommissionForAttribution(orderId);
  return { ok: true as const, attribution };
}

export async function manualAttribute(
  orderId: string,
  partnerId: string,
  actor: string,
  note?: string,
) {
  const attribution = await prisma.attribution.upsert({
    where: { orderId },
    create: {
      orderId,
      partnerId,
      method: "MANUAL",
      confidence: "HIGH",
      confirmedBy: actor,
      note,
    },
    update: {
      partnerId,
      method: "MANUAL",
      confidence: "HIGH",
      confirmedBy: actor,
      note,
    },
  });

  await upsertCommissionForAttribution(orderId);

  await prisma.auditLog.create({
    data: {
      actor,
      action: "manual_attribute",
      entity: "KaspiOrder",
      entityId: orderId,
      meta: { partnerId, note },
    },
  });

  return attribution;
}
