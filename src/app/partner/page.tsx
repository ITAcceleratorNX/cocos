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
    email: "",
    consent: true,
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ referralCode: string } | null>(null);
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
        body: JSON.stringify({
          ...form,
          nick: form.nick || undefined,
          email: form.email || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const map: Record<string, string> = {
          phone_taken: "Этот телефон уже зарегистрирован",
          email_taken: "Этот email уже зарегистрирован",
          nick_taken: "Ник занят — выберите другой",
          invalid_phone: "Проверьте номер телефона",
          validation: "Проверьте поля формы",
        };
        throw new Error(map[data.error] || data.error || "Ошибка");
      }
      setDone({ referralCode: data.partner.referralCode });
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
          <p className="eyebrow">Реферальная программа</p>
          <h1 className="page-title">Рекомендуй CoCo’s и получай бонусы</h1>
          <p className="muted" style={{ margin: "0.75rem 0 0", maxWidth: 480, fontSize: "1.02rem" }}>
            Персональные ссылки на товары, учёт открытий и переходов в Kaspi. Бонусы начисляет
            администратор вручную.
          </p>

          <div className="apply-steps">
            {[
              ["1", "Регистрация", "Имя и телефон — кабинет сразу доступен"],
              ["2", "Ссылки", "Скопируйте ссылку на любой товар"],
              ["3", "Трафик", "Друг открыл товар → перешёл в Kaspi"],
              ["4", "Бонусы", "Админ начисляет по результатам"],
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
              <h2 className="panel-title">Регистрация клиента</h2>
              <p className="panel-subtitle">После регистрации войдите в кабинет по SMS-коду</p>
            </div>

            <div className="form-field">
              <label htmlFor="name">Ваше имя</label>
              <input
                id="name"
                className="input"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">Телефон</label>
              <input
                id="phone"
                className="input"
                type="tel"
                required
                placeholder="+7 (700) 000-00-00"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email (если SMS недоступен)</label>
              <input
                id="email"
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="city">Город</label>
              <input
                id="city"
                className="input"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="nick">Ник (необязательно)</label>
              <input
                id="nick"
                className="input"
                placeholder="латиницей"
                value={form.nick}
                onChange={(e) => setForm((f) => ({ ...f, nick: e.target.value }))}
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
                Согласен с{" "}
                <Link href="/offer" target="_blank">
                  офертой
                </Link>{" "}
                и{" "}
                <Link href="/privacy" target="_blank">
                  политикой
                </Link>
              </span>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading || !form.consent}>
              {loading ? "Отправляем…" : "Зарегистрироваться"}
            </button>

            <p className="muted" style={{ margin: 0, fontSize: "0.85rem", textAlign: "center" }}>
              Уже есть аккаунт? <Link href="/cabinet/login">Войти</Link>
            </p>
          </form>
        </section>
      </main>

      {done && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setDone(null)}
        >
          <div
            className="modal-card panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">Готово</p>
            <h2 className="panel-title">Ваш реферальный ID</h2>
            <p className="panel-subtitle">
              <code style={{ fontSize: "1.25rem" }}>{done.referralCode}</code>
            </p>
            <p className="muted">Войдите в кабинет, чтобы копировать ссылки на товары.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <Link href="/cabinet/login" className="btn btn-primary">
                Войти в кабинет
              </Link>
              <button type="button" className="btn btn-ghost" onClick={() => setDone(null)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
