"use client";

import { useRouter } from "next/navigation";

const STATUSES = [
  "COMPLETED",
  "ACCEPTED_BY_MERCHANT",
  "APPROVED_BY_BANK",
  "CANCELLED",
  "RETURNED",
  "OTHER",
] as const;

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();

  async function onChange(next: string) {
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <select
      className="input"
      style={{ padding: "0.3rem 0.4rem", minWidth: 140 }}
      value={status}
      onChange={(e) => onChange(e.target.value)}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
