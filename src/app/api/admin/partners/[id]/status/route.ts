import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["PENDING", "APPROVED", "BLOCKED"]),
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
    data: {
      status: parsed.data.status,
      approvedAt: parsed.data.status === "APPROVED" ? new Date() : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "partner_status",
      entity: "Partner",
      entityId: id,
      meta: { status: parsed.data.status },
    },
  });

  return NextResponse.json({ ok: true, partner });
}
