"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

export default function CabinetLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "error");
      setStep("code");
      setHint(data.mock ? `Тестовый код: ${data.code}` : "Код отправлен");
    } catch {
      setError("Партнёр не найден или заблокирован");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "error");
      router.push("/cabinet");
      router.refresh();
    } catch {
      setError("Неверный код");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="auth-shell">
        <div className="container-narrow">
          <div className="panel form-stack">
            <div>
              <p className="eyebrow">Кабинет партнёра</p>
              <h1 className="panel-title">Вход по телефону</h1>
              <p className="panel-subtitle">
                Без пароля — только код. На MVP используйте код 000000.
              </p>
            </div>

            {step === "phone" ? (
              <form onSubmit={requestCode} className="form-stack">
                <div className="form-field">
                  <label htmlFor="phone">Ваш телефон</label>
                  <input
                    id="phone"
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (700) 000-00-00"
                    required
                  />
                </div>
                {error && <p className="form-error">{error}</p>}
                <button className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? "Отправляем…" : "Получить код"}
                </button>
              </form>
            ) : (
              <form onSubmit={verify} className="form-stack">
                {hint && <p className="form-ok">{hint}</p>}
                <div className="form-field">
                  <label htmlFor="code">Код из SMS</label>
                  <input
                    id="code"
                    className="input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    required
                  />
                </div>
                {error && <p className="form-error">{error}</p>}
                <button className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? "Проверяем…" : "Войти"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  onClick={() => {
                    setStep("phone");
                    setError(null);
                  }}
                >
                  Изменить телефон
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
