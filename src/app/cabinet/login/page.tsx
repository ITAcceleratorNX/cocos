"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

export default function CabinetLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"id" | "code">("id");
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
        body: JSON.stringify(mode === "phone" ? { phone } : { email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "error");
      setStep("code");
      setHint(
        data.mock
          ? `Тестовый код: ${data.code}`
          : data.channel === "email"
            ? "Код отправлен на email"
            : "Код отправлен в SMS",
      );
    } catch {
      setError("Клиент не найден или заблокирован");
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
        body: JSON.stringify({
          code,
          ...(mode === "phone" ? { phone } : { email }),
        }),
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
              <p className="eyebrow">Кабинет клиента</p>
              <h1 className="panel-title">Вход</h1>
              <p className="panel-subtitle">
                SMS через Mobizon (когда дадут ключ) или email. На MVP код{" "}
                <code>000000</code>.
              </p>
            </div>

            {step === "id" ? (
              <form onSubmit={requestCode} className="form-stack">
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${mode === "phone" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setMode("phone")}
                  >
                    Телефон
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${mode === "email" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setMode("email")}
                  >
                    Email
                  </button>
                </div>
                {mode === "phone" ? (
                  <div className="form-field">
                    <label htmlFor="phone">Телефон</label>
                    <input
                      id="phone"
                      className="input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (700) 000-00-00"
                      required
                    />
                  </div>
                ) : (
                  <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      className="input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}
                {error && <p className="form-error">{error}</p>}
                <button className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? "Отправляем…" : "Получить код"}
                </button>
                <p className="muted" style={{ margin: 0, textAlign: "center", fontSize: "0.85rem" }}>
                  Нет аккаунта? <Link href="/partner">Регистрация</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={verify} className="form-stack">
                {hint && <p className="form-ok">{hint}</p>}
                <div className="form-field">
                  <label htmlFor="code">Код</label>
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
                    setStep("id");
                    setError(null);
                  }}
                >
                  Назад
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
