import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(160).optional(),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  sku: z.string().max(64).nullable().optional(),
  kaspiUrl: z.string().url().optional(),
  priceKzt: z.number().int().positive().optional(),
  imageUrl: z.string().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  if (parsed.data.slug) {
    const clash = await prisma.product.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (clash) {
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true, product });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  // Soft-delete: deactivate instead of hard delete (keeps history)
  const product = await prisma.product.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true, product });
}
