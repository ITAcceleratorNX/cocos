import { NextResponse } from "next/server";
import { z } from "zod";
import { getPartnerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  bio: z.string().max(500).optional(),
  iin: z
    .string()
    .regex(/^\d{12}$/, "iin_12")
    .optional()
    .or(z.literal("")),
  payoutRequisites: z.string().max(200).optional(),
});

export async function PATCH(req: Request) {
  const session = await getPartnerSession();
  if (!session) {
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

  const partner = await prisma.partner.update({
    where: { id: session.partnerId },
    data: {
      bio: parsed.data.bio?.trim(),
      iin: parsed.data.iin === "" ? null : parsed.data.iin,
      payoutRequisites: parsed.data.payoutRequisites?.trim() || null,
    },
  });

  return NextResponse.json({
    ok: true,
    partner: {
      bio: partner.bio,
      iin: partner.iin,
      payoutRequisites: partner.payoutRequisites,
    },
  });
}
