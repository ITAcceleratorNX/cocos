"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@cocos.kz");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Неверный логин или пароль");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="auth-shell">
      <div className="container-narrow">
        <form onSubmit={onSubmit} className="panel form-stack">
          <div>
            <p className="eyebrow">CoCo’s Admin</p>
            <h1 className="panel-title">Вход в админку</h1>
            <p className="panel-subtitle">Одобрение партнёров, заказы и выплаты</p>
          </div>

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

          <div className="form-field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Входим…" : "Войти"}
          </button>

          <Link href="/" className="skip-link" style={{ display: "block" }}>
            ← На сайт
          </Link>
        </form>
      </div>
    </main>
  );
}
