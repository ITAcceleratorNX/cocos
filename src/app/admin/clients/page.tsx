import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminClientsPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const clients = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { referralEvents: true },
      },
    },
  });

  const openCounts = await prisma.referralEvent.groupBy({
    by: ["partnerId", "type"],
    _count: { _all: true },
  });

  function count(partnerId: string, type: "OPEN" | "KASPI_CLICK") {
    return (
      openCounts.find((r) => r.partnerId === partnerId && r.type === type)?._count
        ._all || 0
    );
  }

  return (
    <main className="container page-stack" style={{ paddingTop: "1.5rem" }}>
      <div>
        <h1 className="page-title">Клиенты</h1>
        <p className="muted">Реферальный ID, активность и бонусы</p>
      </div>

      <div className="table-wrap panel">
        <table className="table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Контакт</th>
              <th>Ref ID</th>
              <th>Открытия</th>
              <th>Kaspi</th>
              <th>Бонус ₸</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>
                  <div>{c.phone.startsWith("email_") ? "—" : c.phone}</div>
                  {c.email && <div className="muted">{c.email}</div>}
                </td>
                <td>
                  <code>{c.referralCode}</code>
                </td>
                <td>{count(c.id, "OPEN")}</td>
                <td>{count(c.id, "KASPI_CLICK")}</td>
                <td>{c.bonusBalance.toLocaleString("ru-KZ")}</td>
                <td>
                  <Link href={`/admin/clients/${c.id}`} className="btn btn-ghost btn-sm">
                    Карточка
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
