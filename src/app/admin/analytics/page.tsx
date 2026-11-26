import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { referralStats } from "@/lib/referral";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; partnerId?: string; productId?: string }>;
}) {
  if (!(await getAdminSession())) redirect("/admin/login");
  const sp = await searchParams;

  const [clients, products, stats, top] = await Promise.all([
    prisma.partner.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    referralStats({
      partnerId: sp.partnerId,
      productId: sp.productId,
      from: sp.from,
      to: sp.to,
    }),
    prisma.referralEvent.groupBy({
      by: ["partnerId"],
      where: {
        type: "KASPI_CLICK",
        ...(sp.from || sp.to
          ? {
              createdAt: {
                ...(sp.from ? { gte: new Date(sp.from) } : {}),
                ...(sp.to
                  ? { lte: new Date(new Date(sp.to).setHours(23, 59, 59, 999)) }
                  : {}),
              },
            }
          : {}),
        ...(sp.productId ? { productId: sp.productId } : {}),
      },
      _count: { _all: true },
      orderBy: { _count: { partnerId: "desc" } },
      take: 15,
    }),
  ]);

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  return (
    <main className="container page-stack" style={{ paddingTop: "1.5rem" }}>
      <div>
        <h1 className="page-title">Аналитика</h1>
        <p className="muted">Открытия ссылок и переходы в Kaspi по фильтрам</p>
      </div>

      <section className="panel">
        <form className="form-grid" method="get">
          <div className="form-field">
            <label htmlFor="from">С</label>
            <input id="from" name="from" type="date" className="input" defaultValue={sp.from || ""} />
          </div>
          <div className="form-field">
            <label htmlFor="to">По</label>
            <input id="to" name="to" type="date" className="input" defaultValue={sp.to || ""} />
          </div>
          <div className="form-field">
            <label htmlFor="partnerId">Клиент</label>
            <select id="partnerId" name="partnerId" className="input" defaultValue={sp.partnerId || ""}>
              <option value="">Все</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.referralCode})
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="productId">Товар</label>
            <select id="productId" name="productId" className="input" defaultValue={sp.productId || ""}>
              <option value="">Все</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field" style={{ alignSelf: "end" }}>
            <button type="submit" className="btn btn-primary">
              Применить
            </button>
          </div>
        </form>
      </section>

      <section className="stats-grid">
        {[
          ["Открытия", stats.opens],
          ["Уникальные", stats.uniqueOpens],
          ["Повторные", stats.repeatOpens],
          ["Переходы Kaspi", stats.kaspiClicks],
        ].map(([l, v]) => (
          <div key={String(l)} className="card stat-card">
            <div className="muted" style={{ fontSize: "0.8rem" }}>
              {l}
            </div>
            <div className="stat-value">{v}</div>
          </div>
        ))}
      </section>

      <section className="panel">
        <h2 className="section-title">Топ по переходам в Kaspi</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Ref</th>
                <th>Kaspi</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {top.map((row) => {
                const c = clientMap[row.partnerId];
                return (
                  <tr key={row.partnerId}>
                    <td>{c?.name || row.partnerId}</td>
                    <td>
                      <code>{c?.referralCode}</code>
                    </td>
                    <td>{row._count._all}</td>
                    <td>
                      <Link href={`/admin/clients/${row.partnerId}`} className="btn btn-ghost btn-sm">
                        Карточка
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
