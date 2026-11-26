import { NextResponse } from "next/server";
import { clearPartnerSession } from "@/lib/auth";

export async function POST() {
  await clearPartnerSession();
  return NextResponse.json({ ok: true });
}
