import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="auth-shell">
        <div className="container-narrow">
          <div className="panel success-panel">
            <p className="eyebrow">404</p>
            <h1 className="panel-title">Страница не найдена</h1>
            <p className="panel-subtitle">
              Возможно, партнёр ещё не одобрен или ссылка устарела.
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              <Link href="/" className="btn btn-primary btn-block">
                На главную
              </Link>
              <Link href="/partner" className="btn btn-ghost btn-block">
                Стать партнёром
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
