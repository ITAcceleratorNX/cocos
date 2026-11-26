import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertCommissionForAttribution } from "@/lib/commission";

const schema = z.object({
  status: z.enum([
    "APPROVED_BY_BANK",
    "ACCEPTED_BY_MERCHANT",
    "COMPLETED",
    "CANCELLED",
    "RETURNED",
    "OTHER",
  ]),
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
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const order = await prisma.kaspiOrder.update({
    where: { id },
    data: {
      status: parsed.data.status,
      statusRaw: parsed.data.status,
      completedAt: parsed.data.status === "COMPLETED" ? new Date() : undefined,
    },
  });

  await upsertCommissionForAttribution(id);

  return NextResponse.json({ ok: true, order });
}
