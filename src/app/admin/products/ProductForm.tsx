"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  kaspiUrl: string;
  priceKzt: number;
  imageUrl: string | null;
  description: string | null;
  active: boolean;
  sortOrder: number;
};

const empty = {
  name: "",
  slug: "",
  sku: "",
  kaspiUrl: "",
  priceKzt: "",
  imageUrl: "",
  description: "",
  active: true,
  sortOrder: "100",
};

export function ProductManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      sku: p.sku || "",
      kaspiUrl: p.kaspiUrl,
      priceKzt: String(p.priceKzt),
      imageUrl: p.imageUrl || "",
      description: p.description || "",
      active: p.active,
      sortOrder: String(p.sortOrder),
    });
    setMsg(null);
  }

  function reset() {
    setEditingId(null);
    setForm(empty);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const payload = {
      name: form.name,
      slug: form.slug,
      sku: form.sku || null,
      kaspiUrl: form.kaspiUrl,
      priceKzt: Number(form.priceKzt),
      imageUrl: form.imageUrl || null,
      description: form.description || null,
      active: form.active,
      sortOrder: Number(form.sortOrder) || 100,
    };

    const res = await fetch(
      editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error === "slug_taken" ? "Slug занят" : "Ошибка сохранения");
      return;
    }
    setMsg(editingId ? "Обновлено" : "Создано");
    reset();
    router.refresh();
  }

  async function deactivate(id: string) {
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function reactivate(id: string) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    router.refresh();
  }

  return (
    <div className="page-stack" style={{ gap: "1rem" }}>
      <form onSubmit={onSubmit} className="admin-panel form-stack">
        <h2 className="section-title" style={{ margin: 0 }}>
          {editingId ? "Редактировать товар" : "Добавить товар"}
        </h2>
        <div className="form-grid">
          <div>
            <label className="label">Название</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Slug (латиница)</label>
            <input
              className="input"
              required
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                })
              }
            />
          </div>
          <div>
            <label className="label">SKU Kaspi</label>
            <input
              className="input"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Цена ₸</label>
            <input
              className="input"
              type="number"
              required
              value={form.priceKzt}
              onChange={(e) => setForm({ ...form, priceKzt: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Ссылка Kaspi</label>
            <input
              className="input"
              required
              value={form.kaspiUrl}
              onChange={(e) => setForm({ ...form, kaspiUrl: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">URL фото</label>
            <input
              className="input"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="/landing/assets/products/..."
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Описание</label>
            <textarea
              className="input"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Порядок</label>
            <input
              className="input"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Активен
          </label>
        </div>
        {msg && <p className="form-ok">{msg}</p>}
        <div className="admin-actions">
          <button className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? "…" : editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
              Отмена
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Slug</th>
              <th>Цена</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td>
                  <code>{p.slug}</code>
                </td>
                <td>{p.priceKzt.toLocaleString("ru-KZ")} ₸</td>
                <td>
                  <span className={`badge ${p.active ? "badge-ok" : "badge-bad"}`}>
                    {p.active ? "активен" : "выкл"}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => startEdit(p)}>
                      Изменить
                    </button>
                    {p.active ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => deactivate(p.id)}
                      >
                        Выкл
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => reactivate(p.id)}
                      >
                        Вкл
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
