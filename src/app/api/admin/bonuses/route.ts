import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { applyBonus } from "@/lib/bonus";

const schema = z.object({
  partnerId: z.string().min(1),
  amountKzt: z.number().int().positive(),
  kind: z.enum(["CREDIT", "PAYOUT", "CORRECTION"]),
  comment: z.string().min(2).max(500),
  idempotencyKey: z.string().min(8).max(80).optional(),
});

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const amount = parsed.data.amountKzt;

  try {
    // MVP: CREDIT/CORRECTION = +amount, PAYOUT = -amount (use PAYOUT to decrease balance).
    const result = await applyBonus({
      partnerId: parsed.data.partnerId,
      amountKzt:
        parsed.data.kind === "PAYOUT" ? -Math.abs(amount) : Math.abs(amount),
      kind: parsed.data.kind,
      comment: parsed.data.comment,
      adminActor: process.env.ADMIN_EMAIL || "admin",
      idempotencyKey: parsed.data.idempotencyKey,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
