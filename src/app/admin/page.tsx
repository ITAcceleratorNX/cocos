import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KaspiSyncPanel } from "./KaspiSyncPanel";

export default async function AdminDashboard() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const [partners, pending, clicks, leads, orders, unattributed, commissions, lastSync] =
    await Promise.all([
      prisma.partner.count(),
      prisma.partner.count({ where: { status: "PENDING" } }),
      prisma.click.count(),
      prisma.lead.count(),
      prisma.kaspiOrder.count(),
      prisma.kaspiOrder.count({ where: { attribution: null } }),
      prisma.commission.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { amountKzt: true },
      }),
      prisma.setting.findUnique({ where: { key: "kaspi_last_sync_at" } }),
    ]);

  const cards = [
    ["Партнёры", partners, "/admin/partners"],
    ["Ждут одобрения", pending, "/admin/partners"],
    ["Переходы", clicks, "/admin"],
    ["Лиды", leads, "/admin"],
    ["Заказы", orders, "/admin/orders"],
    ["Без партнёра", unattributed, "/admin/orders"],
    ["К выплате ₸", commissions._sum.amountKzt || 0, "/admin/payouts"],
  ] as const;

  return (
    <main className="page-stack">
      <div className="admin-page-head">
        <div>
          <h1 className="page-title">Дашборд</h1>
          <p className="muted" style={{ margin: 0 }}>
            Воронка партнёрки · последний Kaspi sync:{" "}
            {lastSync?.value ? new Date(lastSync.value).toLocaleString("ru-KZ") : "ещё не было"}
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/orders" className="btn btn-primary btn-sm">
            Добавить заказ
          </Link>
          <Link href="/admin/partners" className="btn btn-ghost btn-sm">
            Партнёры
          </Link>
        </div>
      </div>

      <div className="admin-stat-grid">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="admin-stat">
            <div className="admin-stat__label">{label}</div>
            <div className="admin-stat__value">{value}</div>
          </Link>
        ))}
      </div>

      <KaspiSyncPanel />
    </main>
  );
}
