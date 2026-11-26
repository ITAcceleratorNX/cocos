import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  commissionRate: z.number().min(0).max(100),
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

  const partner = await prisma.partner.update({
    where: { id },
    data: { commissionRate: parsed.data.commissionRate },
  });

  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "partner_rate",
      entity: "Partner",
      entityId: id,
      meta: { commissionRate: parsed.data.commissionRate },
    },
  });

  return NextResponse.json({ ok: true, partner });
}
