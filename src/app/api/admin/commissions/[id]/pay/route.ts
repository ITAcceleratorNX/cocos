import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.commission.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (existing.status === "CANCELLED") {
    return NextResponse.json({ error: "cancelled" }, { status: 400 });
  }

  const commission = await prisma.commission.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "commission_paid",
      entity: "Commission",
      entityId: id,
      meta: { amountKzt: commission.amountKzt },
    },
  });

  return NextResponse.json({ ok: true, commission });
}
