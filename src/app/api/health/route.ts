import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      service: "cocos-partner",
      time: new Date().toISOString(),
      appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
      kaspiToken: Boolean(process.env.KASPI_API_TOKEN),
      mockSms: process.env.MOCK_SMS !== "false",
    });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
