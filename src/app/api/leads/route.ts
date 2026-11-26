import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";

const schema = z.object({
  partnerNick: z.string().min(2),
  productSlug: z.string().optional(),
  phone: z.string().min(10),
  cookieId: z.string().optional(),
  consent: z.literal(true),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const partner = await prisma.partner.findUnique({
    where: { nick: parsed.data.partnerNick.toLowerCase() },
  });
  if (!partner || partner.status !== "APPROVED") {
    return NextResponse.json({ error: "partner_unavailable" }, { status: 404 });
  }

  let productId: string | undefined;
  if (parsed.data.productSlug) {
    const product = await prisma.product.findUnique({
      where: { slug: parsed.data.productSlug },
    });
    productId = product?.id;
  }

  const lead = await prisma.lead.create({
    data: {
      partnerId: partner.id,
      productId,
      phone,
      cookieId: parsed.data.cookieId,
      consent: true,
    },
  });

  return NextResponse.json({ ok: true, leadId: lead.id });
}
