import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(160),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  sku: z.string().max(64).optional().or(z.literal("")),
  kaspiUrl: z.string().url(),
  priceKzt: z.number().int().positive(),
  imageUrl: z.string().optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const exists = await prisma.product.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (exists) {
    return NextResponse.json({ error: "slug_taken" }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name.trim(),
      slug: parsed.data.slug,
      sku: parsed.data.sku || null,
      kaspiUrl: parsed.data.kaspiUrl,
      priceKzt: parsed.data.priceKzt,
      imageUrl: parsed.data.imageUrl || null,
      description: parsed.data.description || null,
      active: parsed.data.active ?? true,
      sortOrder: parsed.data.sortOrder ?? 100,
    },
  });

  return NextResponse.json({ ok: true, product });
}
