import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PartnerStatusButtons } from "./PartnerStatusButtons";
import { PartnerRateInput } from "./PartnerRateInput";

export default async function AdminPartnersPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { clicks: true, leads: true, attributions: true } },
    },
  });

  const pending = partners.filter((p) => p.status === "PENDING").length;

  return (
    <main className="page-stack">
      <div className="admin-page-head">
        <div>
          <h1 className="page-title">Партнёры</h1>
          <p className="muted" style={{ margin: 0 }}>
            Всего {partners.length}
            {pending ? ` · ждут одобрения: ${pending}` : ""}
          </p>
        </div>
      </div>

      <div className="admin-table-wrap">
        {partners.length === 0 ? (
          <div className="admin-empty">Пока нет заявок</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Nick</th>
                <th>Телефон</th>
                <th>Статус</th>
                <th>Ставка</th>
                <th>Клики</th>
                <th>Лиды</th>
                <th>Заказы</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.city ? <div className="muted" style={{ fontSize: "0.8rem" }}>{p.city}</div> : null}
                  </td>
                  <td>
                    <Link href={`/p/${p.nick}`}>
                      <code>@{p.nick}</code>
                    </Link>
                  </td>
                  <td>{p.phone}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.status === "APPROVED"
                          ? "badge-ok"
                          : p.status === "BLOCKED"
                            ? "badge-bad"
                            : "badge-warn"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <PartnerRateInput id={p.id} rate={Number(p.commissionRate)} />
                  </td>
                  <td>{p._count.clicks}</td>
                  <td>{p._count.leads}</td>
                  <td>{p._count.attributions}</td>
                  <td>
                    <PartnerStatusButtons id={p.id} status={p.status} />
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
