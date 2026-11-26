"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileForm({
  bio,
  iin,
  payoutRequisites,
}: {
  bio: string;
  iin: string;
  payoutRequisites: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ bio, iin, payoutRequisites });
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setOk(false);
    try {
      const res = await fetch("/api/cabinet/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error === "validation" && form.iin && !/^\d{12}$/.test(form.iin)
            ? "ИИН: ровно 12 цифр"
            : "Не удалось сохранить",
        );
      }
      setMsg("Сохранено");
      setOk(true);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form-stack">
      <div className="form-field">
        <label htmlFor="bio">Текст на странице</label>
        <textarea
          id="bio"
          className="input"
          rows={3}
          maxLength={500}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Коротко о себе для покупателей"
        />
      </div>
      <div className="form-field">
        <label htmlFor="iin">ИИН (12 цифр)</label>
        <input
          id="iin"
          className="input"
          inputMode="numeric"
          maxLength={12}
          value={form.iin}
          onChange={(e) => setForm({ ...form, iin: e.target.value.replace(/\D/g, "") })}
          placeholder="000000000000"
        />
      </div>
      <div className="form-field">
        <label htmlFor="req">Реквизиты выплаты (Kaspi Gold / IBAN)</label>
        <input
          id="req"
          className="input"
          value={form.payoutRequisites}
          onChange={(e) => setForm({ ...form, payoutRequisites: e.target.value })}
          placeholder="Kaspi Gold +7… или IBAN"
        />
      </div>
      {msg && <p className={ok ? "form-ok" : "form-error"}>{msg}</p>}
      <button className="btn btn-primary btn-block-mobile" disabled={loading}>
        {loading ? "Сохраняем…" : "Сохранить"}
      </button>
    </form>
  );
}
