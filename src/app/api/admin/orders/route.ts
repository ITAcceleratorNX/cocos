import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import { attributeOrderByPhone } from "@/lib/attribution";
import { upsertCommissionForAttribution } from "@/lib/commission";

const createSchema = z.object({
  kaspiId: z.string().min(1),
  code: z.string().optional(),
  status: z.enum([
    "APPROVED_BY_BANK",
    "ACCEPTED_BY_MERCHANT",
    "COMPLETED",
    "CANCELLED",
    "RETURNED",
    "OTHER",
  ]),
  totalPrice: z.number().int().positive(),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  orderedAt: z.string().datetime().optional(),
  productSlug: z.string().optional(),
  autoAttribute: z.boolean().optional(),
});

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const orders = await prisma.kaspiOrder.findMany({
    include: {
      attribution: { include: { partner: true } },
      commission: true,
      items: { include: { product: true } },
    },
    orderBy: { orderedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ orders });
}

/** Manual order entry for Stage 1 (before Kaspi API sync) */
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const phone = parsed.data.customerPhone
    ? normalizePhone(parsed.data.customerPhone)
    : null;

  let productId: string | undefined;
  if (parsed.data.productSlug) {
    const product = await prisma.product.findUnique({
      where: { slug: parsed.data.productSlug },
    });
    productId = product?.id;
  }

  const order = await prisma.kaspiOrder.create({
    data: {
      kaspiId: parsed.data.kaspiId,
      code: parsed.data.code,
      status: parsed.data.status,
      statusRaw: parsed.data.status,
      totalPrice: parsed.data.totalPrice,
      customerPhone: phone,
      customerName: parsed.data.customerName,
      orderedAt: parsed.data.orderedAt
        ? new Date(parsed.data.orderedAt)
        : new Date(),
      completedAt: parsed.data.status === "COMPLETED" ? new Date() : null,
      items: productId
        ? {
            create: [
              {
                productId,
                name: parsed.data.productSlug,
                quantity: 1,
                unitPrice: parsed.data.totalPrice,
              },
            ],
          }
        : undefined,
    },
  });

  let attributionResult = null;
  if (parsed.data.autoAttribute !== false) {
    attributionResult = await attributeOrderByPhone(order.id);
    if (attributionResult.ok) {
      await upsertCommissionForAttribution(order.id);
    }
  }

  return NextResponse.json({ ok: true, order, attribution: attributionResult });
}
