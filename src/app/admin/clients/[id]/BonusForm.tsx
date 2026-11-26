"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BonusForm({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("1000");
  const [kind, setKind] = useState<"CREDIT" | "PAYOUT" | "CORRECTION">("CREDIT");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    const idempotencyKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `b-${Date.now()}`;
    try {
      const res = await fetch("/api/admin/bonuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId,
          amountKzt: Number(amount),
          kind,
          comment,
          idempotencyKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "error");
      setOk(true);
      setComment("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form-stack">
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="amount">Сумма ₸</label>
          <input
            id="amount"
            className="input"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="kind">Тип</label>
          <select
            id="kind"
            className="input"
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
          >
            <option value="CREDIT">Начисление</option>
            <option value="PAYOUT">Выплата (списать)</option>
            <option value="CORRECTION">Корректировка (+)</option>
          </select>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="comment">Комментарий / основание</label>
        <textarea
          id="comment"
          className="input"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {ok && <p className="form-ok">Сохранено</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "…" : "Начислить бонус"}
      </button>
    </form>
  );
}
