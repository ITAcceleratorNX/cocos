"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PartnerRateInput({ id, rate }: { id: string; rate: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(rate));
  const [saving, setSaving] = useState(false);

  async function save() {
    const next = Number(value);
    if (Number.isNaN(next) || next < 0 || next > 100) return;
    setSaving(true);
    await fetch(`/api/admin/partners/${id}/rate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionRate: next }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="admin-actions">
      <input
        className="input"
        style={{ width: 58, padding: "0.35rem 0.45rem" }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Ставка комиссии"
      />
      <span className="muted" style={{ fontSize: "0.8rem" }}>
        %
      </span>
      <button type="button" className="btn btn-ghost btn-xs" disabled={saving} onClick={save}>
        ✓
      </button>
    </div>
  );
}
