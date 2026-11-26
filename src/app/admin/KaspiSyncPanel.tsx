"use client";

import { useState } from "react";

export function KaspiSyncPanel() {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function probe() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/kaspi/sync");
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error === "kaspi_token_missing" ? "Нет KASPI_API_TOKEN — ждём ПМ" : data.error);
      return;
    }
    setMsg(
      `Probe OK: заказов ${data.probe.ordersSampled}, с телефоном ${data.probe.withCellPhone}`,
    );
  }

  async function sync() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/kaspi/sync", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "Ошибка sync");
      return;
    }
    setMsg(`Sync: обработано ${data.processed}, новых ${data.created}, привязано ${data.attributed}`);
  }

  return (
    <section className="admin-panel">
      <div className="admin-page-head" style={{ marginBottom: "0.85rem" }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>
            Kaspi API
          </h2>
          <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>
            Этап 0/2: проверка токена и ручной sync. Авто — cron раз в час.
          </p>
        </div>
        <div className="admin-actions">
          <button type="button" className="btn btn-ghost btn-sm" disabled={loading} onClick={probe}>
            Проверить API
          </button>
          <button type="button" className="btn btn-primary btn-sm" disabled={loading} onClick={sync}>
            Синхронизировать
          </button>
        </div>
      </div>
      {msg && <p className={msg.includes("Нет") || msg.includes("Ошибка") ? "form-error" : "form-ok"}>{msg}</p>}
    </section>
  );
}
