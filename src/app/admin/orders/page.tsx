import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManualOrderForm } from "./ManualOrderForm";
import { AttributeForm } from "./AttributeForm";
import { OrderStatusSelect } from "./OrderStatusSelect";

export default async function AdminOrdersPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const [orders, partners, products] = await Promise.all([
    prisma.kaspiOrder.findMany({
      include: {
        attribution: { include: { partner: true } },
        commission: true,
        items: true,
      },
      orderBy: { orderedAt: "desc" },
      take: 100,
    }),
    prisma.partner.findMany({
      where: { status: "APPROVED" },
      orderBy: { nick: "asc" },
    }),
    prisma.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <main className="page-stack">
      <div className="admin-page-head">
        <div>
          <h1 className="page-title">Заказы</h1>
          <p className="muted" style={{ margin: 0 }}>
            Ручной ввод · автопривязка по телефону лида (30 дней, last click)
          </p>
        </div>
      </div>

      <ManualOrderForm products={products.map((p) => ({ slug: p.slug, name: p.name }))} />

      <div className="admin-table-wrap">
        {orders.length === 0 ? (
          <div className="admin-empty">Заказов пока нет — добавьте вручную выше</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Kaspi</th>
                <th>Телефон</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Партнёр</th>
                <th>Комиссия</th>
                <th>Привязка</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.orderedAt.toISOString().slice(0, 10)}</td>
                  <td>
                    <code>{o.code || o.kaspiId}</code>
                  </td>
                  <td>{o.customerPhone || "—"}</td>
                  <td>{o.totalPrice.toLocaleString("ru-KZ")} ₸</td>
                  <td>
                    <OrderStatusSelect orderId={o.id} status={o.status} />
                  </td>
                  <td>
                    {o.attribution ? (
                      <code>@{o.attribution.partner.nick}</code>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    {o.commission ? (
                      <>
                        {o.commission.amountKzt.toLocaleString("ru-KZ")} ₸
                        <div className="muted" style={{ fontSize: "0.75rem" }}>
                          {o.commission.status}
                        </div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {!o.attribution && (
                      <AttributeForm
                        orderId={o.id}
                        partners={partners.map((p) => ({ id: p.id, nick: p.nick }))}
                      />
                    )}
                    {o.attribution && <span className="badge">{o.attribution.method}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
