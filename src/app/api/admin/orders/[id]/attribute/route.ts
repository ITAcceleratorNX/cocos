import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { manualAttribute } from "@/lib/attribution";

const schema = z.object({
  partnerId: z.string().min(1),
  note: z.string().optional(),
});

export async function POST(
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

  const attribution = await manualAttribute(
    id,
    parsed.data.partnerId,
    "admin",
    parsed.data.note,
  );

  return NextResponse.json({ ok: true, attribution });
}
