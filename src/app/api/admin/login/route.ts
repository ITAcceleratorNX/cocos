import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const email = process.env.ADMIN_EMAIL || "admin@cocos.kz";
  const password = process.env.ADMIN_PASSWORD || "cocos-admin";

  const emailOk =
    parsed.data.email.toLowerCase() === email.toLowerCase();
  const passwordOk = parsed.data.password === password;

  if (!emailOk || !passwordOk) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
