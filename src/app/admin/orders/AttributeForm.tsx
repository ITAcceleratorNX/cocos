"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AttributeForm({
  orderId,
  partners,
}: {
  orderId: string;
  partners: { id: string; nick: string }[];
}) {
  const router = useRouter();
  const [partnerId, setPartnerId] = useState(partners[0]?.id || "");

  async function submit() {
    if (!partnerId) return;
    await fetch(`/api/admin/orders/${orderId}/attribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId, note: "manual admin" }),
    });
    router.refresh();
  }

  return (
    <div className="admin-actions">
      <select
        className="input"
        style={{ padding: "0.35rem 0.5rem", minWidth: 110 }}
        value={partnerId}
        onChange={(e) => setPartnerId(e.target.value)}
      >
        {partners.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nick}
          </option>
        ))}
      </select>
      <button type="button" className="btn btn-ghost btn-xs" onClick={submit}>
        OK
      </button>
    </div>
  );
}
