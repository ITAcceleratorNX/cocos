import { NextResponse } from "next/server";
import { syncKaspiOrders } from "@/lib/kaspi-sync";

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.KASPI_API_TOKEN) {
    return NextResponse.json(
      { error: "kaspi_token_missing", message: "Set KASPI_API_TOKEN first (Stage 0)" },
      { status: 503 },
    );
  }

  try {
    const result = await syncKaspiOrders({ pages: 5, size: 20 });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: "sync_failed", message: e instanceof Error ? e.message : "unknown" },
      { status: 502 },
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
