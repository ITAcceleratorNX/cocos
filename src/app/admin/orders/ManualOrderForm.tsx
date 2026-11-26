"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ManualOrderForm({
  products,
}: {
  products: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    kaspiId: "",
    code: "",
    status: "COMPLETED",
    totalPrice: "",
    customerPhone: "",
    customerName: "",
    productSlug: products[0]?.slug || "",
    autoAttribute: true,
  });
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        totalPrice: Number(form.totalPrice),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Ошибка");
      return;
    }
    setMsg(
      data.attribution?.ok
        ? "Заказ создан и привязан по телефону"
        : `Заказ создан (${data.attribution?.reason || "без автопривязки"})`,
    );
    setForm((f) => ({ ...f, kaspiId: "", code: "", customerPhone: "", totalPrice: "" }));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="admin-panel form-stack">
      <h2 className="section-title" style={{ margin: 0 }}>
        Добавить заказ вручную
      </h2>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="kaspiId">Kaspi ID</label>
          <input
            id="kaspiId"
            className="input"
            required
            value={form.kaspiId}
            onChange={(e) => setForm({ ...form, kaspiId: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="code">Код заказа</label>
          <input
            id="code"
            className="input"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="customerPhone">Телефон покупателя</label>
          <input
            id="customerPhone"
            className="input"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="totalPrice">Сумма ₸</label>
          <input
            id="totalPrice"
            className="input"
            type="number"
            required
            value={form.totalPrice}
            onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="status">Статус</label>
          <select
            id="status"
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {[
              "COMPLETED",
              "ACCEPTED_BY_MERCHANT",
              "APPROVED_BY_BANK",
              "CANCELLED",
              "RETURNED",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="productSlug">Товар</label>
          <select
            id="productSlug"
            className="input"
            value={form.productSlug}
            onChange={(e) => setForm({ ...form, productSlug: e.target.value })}
          >
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="form-checkbox">
        <input
          type="checkbox"
          checked={form.autoAttribute}
          onChange={(e) => setForm({ ...form, autoAttribute: e.target.checked })}
        />
        <span>Автопривязка по телефону лида</span>
      </label>
      {msg && <p className="form-ok">{msg}</p>}
      <button className="btn btn-primary btn-sm" style={{ justifySelf: "start" }}>
        Сохранить заказ
      </button>
    </form>
  );
}
