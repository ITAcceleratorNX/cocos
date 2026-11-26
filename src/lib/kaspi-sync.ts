import { KaspiOrderStatus, Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { fetchKaspiOrders, type KaspiOrderDto } from "./kaspi";
import { normalizePhone } from "./phone";
import { attributeOrderByPhone } from "./attribution";
import { upsertCommissionForAttribution } from "./commission";

export function mapKaspiStatus(raw: string): KaspiOrderStatus {
  const s = raw.toUpperCase();
  if (s.includes("COMPLETED") || s === "ARCHIVE") return "COMPLETED";
  if (s.includes("CANCEL")) return "CANCELLED";
  if (s.includes("RETURN")) return "RETURNED";
  if (s.includes("ACCEPTED")) return "ACCEPTED_BY_MERCHANT";
  if (s.includes("APPROVED") || s.includes("KASPI_DELIVERY") || s.includes("TRANSMITTED")) {
    return "APPROVED_BY_BANK";
  }
  return "OTHER";
}

async function matchProductId(entry: NonNullable<KaspiOrderDto["entries"]>[number]) {
  const sku = entry.product?.code;
  const name = entry.product?.name;
  if (sku) {
    const bySku = await prisma.product.findFirst({ where: { sku } });
    if (bySku) return bySku.id;
  }
  if (name) {
    const byName = await prisma.product.findFirst({
      where: { name: { contains: name, mode: "insensitive" } },
    });
    if (byName) return byName.id;
  }
  return null;
}

export async function upsertKaspiOrderFromDto(dto: KaspiOrderDto) {
  const status = mapKaspiStatus(dto.status);
  const phone = dto.customer?.cellPhone
    ? normalizePhone(dto.customer.cellPhone) || dto.customer.cellPhone.replace(/\D/g, "")
    : null;
  const customerName = [dto.customer?.firstName, dto.customer?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const orderedAt = dto.creationDate ? new Date(dto.creationDate) : new Date();

  const existing = await prisma.kaspiOrder.findUnique({ where: { kaspiId: dto.id } });

  const order = await prisma.kaspiOrder.upsert({
    where: { kaspiId: dto.id },
    create: {
      kaspiId: dto.id,
      code: dto.code,
      status,
      statusRaw: dto.status,
      totalPrice: Math.round(dto.totalPrice || 0),
      customerPhone: phone,
      customerName: customerName || null,
      orderedAt,
      completedAt: status === "COMPLETED" ? new Date() : null,
      rawJson: dto as unknown as Prisma.InputJsonValue,
    },
    update: {
      code: dto.code,
      status,
      statusRaw: dto.status,
      totalPrice: Math.round(dto.totalPrice || 0),
      customerPhone: phone,
      customerName: customerName || null,
      completedAt: status === "COMPLETED" ? new Date() : undefined,
      rawJson: dto as unknown as Prisma.InputJsonValue,
    },
  });

  if (!existing && dto.entries?.length) {
    for (const entry of dto.entries) {
      const productId = await matchProductId(entry);
      await prisma.kaspiOrderItem.create({
        data: {
          orderId: order.id,
          productId,
          kaspiSku: entry.product?.code || null,
          name: entry.product?.name || null,
          quantity: entry.quantity || 1,
          unitPrice: entry.totalPrice ? Math.round(entry.totalPrice) : null,
        },
      });
    }
  }

  const hasAttribution = await prisma.attribution.findUnique({ where: { orderId: order.id } });
  let attributed = false;
  if (!hasAttribution) {
    const result = await attributeOrderByPhone(order.id);
    attributed = result.ok;
  } else {
    await upsertCommissionForAttribution(order.id);
  }

  return { orderId: order.id, kaspiId: dto.id, status, attributed, isNew: !existing };
}

/** Pull recent Kaspi orders and upsert + auto-attribute by phone. */
export async function syncKaspiOrders(options?: { pages?: number; size?: number }) {
  const pages = options?.pages ?? 3;
  const size = options?.size ?? 20;
  const results = [];

  for (let page = 0; page < pages; page++) {
    const { data } = await fetchKaspiOrders({ page, size });
    if (!data.length) break;
    for (const dto of data) {
      results.push(await upsertKaspiOrderFromDto(dto));
    }
    if (data.length < size) break;
  }

  await prisma.setting.upsert({
    where: { key: "kaspi_last_sync_at" },
    create: { key: "kaspi_last_sync_at", value: new Date().toISOString() },
    update: { value: new Date().toISOString() },
  });

  return {
    processed: results.length,
    created: results.filter((r) => r.isNew).length,
    attributed: results.filter((r) => r.attributed).length,
  };
}
