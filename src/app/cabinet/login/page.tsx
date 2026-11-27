"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { PhoneInput } from "@/components/PhoneInput";

export default function CabinetLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
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
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "error");
      setStep("code");
      setHint(
        data.mock ? `Тестовый код: ${data.code}` : "Код отправлен в SMS",
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
        body: JSON.stringify({ code, phone }),
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
              <p className="panel-subtitle">Код придёт в SMS на ваш номер</p>
            </div>

            {step === "id" ? (
              <form onSubmit={requestCode} className="form-stack">
                <div className="form-field">
                  <label htmlFor="phone">Телефон</label>
                  <PhoneInput
                    id="phone"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+77001234567"
                    required
                  />
                </div>
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
                  <label htmlFor="code">Код из SMS</label>
                  <input
                    id="code"
                    className="input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    autoComplete="one-time-code"
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
