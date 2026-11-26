"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function PartnerApplyPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "Алматы",
    nick: "",
    instagram: "",
    tiktok: "",
    consent: true,
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ nick: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDone(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [done]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const map: Record<string, string> = {
          phone_taken: "Этот телефон уже зарегистрирован",
          nick_taken: "Ник занят — выберите другой",
          invalid_phone: "Проверьте номер телефона",
          validation: "Проверьте поля формы",
        };
        throw new Error(map[data.error] || data.error || "Ошибка");
      }
      setDone({ nick: data.partner.nick });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container apply-layout">
        <section className="apply-copy">
          <p className="eyebrow">Партнёрская программа</p>
          <h1 className="page-title">Рекомендуй CoCo’s — получай % с покупок на Kaspi</h1>
          <p className="muted" style={{ margin: "0.75rem 0 0", maxWidth: 480, fontSize: "1.02rem" }}>
            Личная ссылка для Instagram и TikTok. Покупатель оформляет заказ в Kaspi — ты получаешь
            комиссию после выдачи.
          </p>

          <div className="apply-steps">
            {[
              ["1", "Заявка", "Имя, телефон и ник твоей страницы"],
              ["2", "Одобрение", "Менеджер активирует ссылку"],
              ["3", "Трафик", "Сторис → твоя страница → Kaspi"],
              ["4", "Комиссия", "Только за выданные заказы"],
            ].map(([n, t, d]) => (
              <div key={n} className="apply-step">
                <div className="apply-step__n">{n}</div>
                <div>
                  <strong>{t}</strong>
                  <span>{d}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <form onSubmit={onSubmit} className="panel form-stack">
            <div>
              <h2 className="panel-title">Оставьте заявку</h2>
              <p className="panel-subtitle">
                После одобрения получите личную ссылку и доступ в кабинет партнёра
              </p>
            </div>

            <div className="form-field">
              <label htmlFor="name">Ваше имя</label>
              <input
                id="name"
                className="input"
                placeholder="Как вас зовут?"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">Ваш телефон</label>
              <input
                id="phone"
                className="input"
                type="tel"
                inputMode="tel"
                placeholder="+7 (700) 000-00-00"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="city">Город</label>
              <input
                id="city"
                className="input"
                placeholder="Алматы"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="nick">Ник страницы</label>
              <input
                id="nick"
                className="input"
                placeholder="aigerim"
                required
                value={form.nick}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nick: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                  }))
                }
              />
              <span className="muted" style={{ fontSize: "0.78rem" }}>
                Будет ссылка /p/{form.nick || "ваш-ник"}
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="instagram">Instagram</label>
              <input
                id="instagram"
                className="input"
                placeholder="@username"
                value={form.instagram}
                onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="tiktok">TikTok</label>
              <input
                id="tiktok"
                className="input"
                placeholder="@username"
                value={form.tiktok}
                onChange={(e) => setForm((f) => ({ ...f, tiktok: e.target.value }))}
              />
            </div>

            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                required
              />
              <span>
                Согласна с{" "}
                <Link href="/offer" style={{ textDecoration: "underline" }}>
                  условиями программы
                </Link>{" "}
                и{" "}
                <Link href="/privacy" style={{ textDecoration: "underline" }}>
                  обработкой персональных данных
                </Link>
              </span>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary btn-block" disabled={loading || !form.consent}>
              {loading ? "Отправляем…" : "Отправить заявку"}
            </button>
          </form>
        </section>
      </main>

      {done && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDone(null);
          }}
        >
          <div
            className="modal-card success-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-success-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Закрыть"
              onClick={() => setDone(null)}
            >
              ×
            </button>
            <div className="success-panel__icon" aria-hidden>
              ✓
            </div>
            <h2 id="apply-success-title" className="panel-title">
              Заявка отправлена
            </h2>
            <p className="panel-subtitle" style={{ marginBottom: "1.25rem" }}>
              Ник <strong>{done.nick}</strong> зарезервирован. После одобрения страница будет{" "}
              <code>/p/{done.nick}</code>
            </p>
            <Link href="/cabinet/login" className="btn btn-primary btn-block">
              Войти в кабинет
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
