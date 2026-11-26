"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PayOneButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    await fetch(`/api/admin/commissions/${id}/pay`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-ghost btn-xs" disabled={loading} onClick={pay}>
      Выплачено
    </button>
  );
}

export function PayAllButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function payAll() {
    if (!confirm("Отметить все CONFIRMED как выплаченные?")) return;
    setLoading(true);
    await fetch("/api/admin/commissions/pay-all", { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" disabled={loading} onClick={payAll}>
      {loading ? "…" : "Все → выплачено"}
    </button>
  );
}
