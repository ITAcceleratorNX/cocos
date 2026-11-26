import { SiteHeader } from "@/components/SiteHeader";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="container page-stack" style={{ maxWidth: 720 }}>
        <p className="eyebrow">Документы</p>
        <h1 className="page-title">Политика персональных данных</h1>
        <div className="panel">
          <p className="muted" style={{ marginTop: 0 }}>
            Черновик. Финальный текст — через юриста.
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--text-muted)" }}>
            <li>Собираем телефон и данные заявки для учёта продаж.</li>
            <li>Партнёр не видит телефоны и имена покупателей — только суммы и статусы.</li>
            <li>Токен Kaspi API хранится только на сервере.</li>
          </ul>
        </div>
      </main>
    </>
  );
}
