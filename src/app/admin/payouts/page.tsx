import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PayAllButton, PayOneButton } from "./PayButtons";

export default async function AdminPayoutsPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const commissions = await prisma.commission.findMany({
    where: { status: { in: ["CONFIRMED", "PAID"] } },
    include: { partner: true, order: true },
    orderBy: { createdAt: "desc" },
  });

  const toPay = commissions
    .filter((c) => c.status === "CONFIRMED")
    .reduce((s, c) => s + c.amountKzt, 0);

  return (
    <main className="page-stack">
      <div className="admin-page-head">
        <div>
          <h1 className="page-title">Выплаты</h1>
          <p className="muted" style={{ margin: 0 }}>
            К выплате: <strong>{toPay.toLocaleString("ru-KZ")} ₸</strong>
          </p>
        </div>
        <div className="admin-actions">
          <a className="btn btn-primary btn-sm" href="/api/admin/export/payouts">
            Скачать Excel
          </a>
          <PayAllButton />
        </div>
      </div>

      <div className="admin-table-wrap">
        {commissions.length === 0 ? (
          <div className="admin-empty">Подтверждённых комиссий пока нет</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Партнёр</th>
                <th>Заказ</th>
                <th>Ставка</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.partner.name}</strong>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>
                      @{c.partner.nick}
                    </div>
                  </td>
                  <td>
                    <code>{c.order.code || c.order.kaspiId}</code>
                  </td>
                  <td>{Number(c.rate)}%</td>
                  <td>{c.amountKzt.toLocaleString("ru-KZ")} ₸</td>
                  <td>
                    <span className={`badge ${c.status === "PAID" ? "badge-ok" : "badge-warn"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{c.status === "CONFIRMED" && <PayOneButton id={c.id} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
