import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Mark all CONFIRMED commissions as PAID (after Excel payout). */
export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await prisma.commission.updateMany({
    where: { status: "CONFIRMED" },
    data: { status: "PAID", paidAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "commission_pay_all",
      entity: "Commission",
      meta: { count: result.count },
    },
  });

  return NextResponse.json({ ok: true, count: result.count });
}
