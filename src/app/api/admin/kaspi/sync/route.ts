import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { syncKaspiOrders } from "@/lib/kaspi-sync";
import { probeKaspiApi } from "@/lib/kaspi";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.KASPI_API_TOKEN) {
    return NextResponse.json({ ok: false, error: "kaspi_token_missing" }, { status: 503 });
  }
  try {
    const probe = await probeKaspiApi();
    return NextResponse.json({ ok: true, probe });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "probe_failed" },
      { status: 502 },
    );
  }
}

export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.KASPI_API_TOKEN) {
    return NextResponse.json({ error: "kaspi_token_missing" }, { status: 503 });
  }
  try {
    const result = await syncKaspiOrders({ pages: 3, size: 20 });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "sync_failed" },
      { status: 502 },
    );
  }
}
