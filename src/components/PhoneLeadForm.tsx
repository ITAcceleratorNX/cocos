"use client";

import { useState } from "react";

type Props = {
  partnerNick: string;
  productSlug?: string;
  kaspiUrl: string;
  goPath?: string;
};

export function PhoneLeadForm({ partnerNick, productSlug, kaspiUrl, goPath }: Props) {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("Нужно согласие на обработку данных");
      return;
    }
    setLoading(true);
    try {
      const cookieId =
        typeof document !== "undefined"
          ? document.cookie
              .split("; ")
              .find((c) => c.startsWith("cocos_vid="))
              ?.split("=")[1]
          : undefined;

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerNick,
          productSlug,
          phone,
          cookieId,
          consent: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Не удалось сохранить телефон");
      }

      window.location.href = goPath || kaspiUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="lead-panel form-stack">
      <div>
        <h2 className="panel-title" style={{ fontSize: "1.25rem" }}>
          Купить в Kaspi
        </h2>
        <p className="lead-panel__hint">
          Оставьте телефон — так покупка учтётся партнёру. Оплата и доставка остаются в Kaspi.
        </p>
      </div>

      <div className="form-field">
        <label htmlFor="lead-phone">Ваш телефон</label>
        <input
          id="lead-phone"
          className="input"
          inputMode="tel"
          placeholder="+7 (700) 000-00-00"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <label className="form-checkbox">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>Согласна на обработку персональных данных</span>
      </label>

      {error && <p className="form-error">{error}</p>}

      <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
        {loading ? "Сохраняем…" : "Перейти в Kaspi"}
      </button>

      <a className="skip-link" href={goPath || kaspiUrl}>
        Пропустить и открыть Kaspi
      </a>
    </form>
  );
}
