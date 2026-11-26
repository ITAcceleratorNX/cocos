import { SiteHeader } from "@/components/SiteHeader";

export default function OfferPage() {
  return (
    <>
      <SiteHeader />
      <main className="container page-stack" style={{ maxWidth: 720 }}>
        <p className="eyebrow">Документы</p>
        <h1 className="page-title">Оферта партнёрской программы</h1>
        <div className="panel">
          <p className="muted" style={{ marginTop: 0 }}>
            Черновик. Финальный текст готовит юрист / заказчик.
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--text-muted)" }}>
            <li>Партнёр получает персональную ссылку после одобрения.</li>
            <li>Комиссия — только по заказам со статусом «Выдан» (COMPLETED).</li>
            <li>При отмене/возврате комиссия аннулируется.</li>
            <li>Выплаты вручную по Excel (автовыплаты не входят в MVP).</li>
          </ul>
        </div>
      </main>
    </>
  );
}
