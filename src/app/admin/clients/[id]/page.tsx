import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { referralStats } from "@/lib/referral";
import { BonusForm } from "./BonusForm";

export default async function AdminClientCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string; productId?: string }>;
}) {
  if (!(await getAdminSession())) redirect("/admin/login");
  const { id } = await params;
  const sp = await searchParams;

  const client = await prisma.partner.findUnique({ where: { id } });
  if (!client) notFound();

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const stats = await referralStats({
    partnerId: id,
    productId: sp.productId,
    from: sp.from,
    to: sp.to,
  });

  const events = await prisma.referralEvent.findMany({
    where: {
      partnerId: id,
      ...(sp.productId ? { productId: sp.productId } : {}),
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
    },
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const bonuses = await prisma.bonusLedger.findMany({
    where: { partnerId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="container page-stack" style={{ paddingTop: "1.5rem" }}>
      <Link href="/admin/clients" className="back-link">
        ← Клиенты
      </Link>

      <section className="card partner-hero">
        <p className="eyebrow">Карточка клиента</p>
        <h1 className="page-title" style={{ marginTop: "0.35rem" }}>
          {client.name}
        </h1>
        <div className="partner-meta">
          <span className="chip">{client.referralCode}</span>
          <span className="muted">
            {client.phone.startsWith("email_") ? client.email : client.phone}
          </span>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Фильтры</h2>
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
          ["Kaspi", stats.kaspiClicks],
          ["Баланс бонусов", client.bonusBalance],
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
        <h2 className="section-title">Начислить бонус</h2>
        <BonusForm partnerId={client.id} />
      </section>

      <section className="panel">
        <h2 className="section-title">События</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Когда</th>
                <th>Тип</th>
                <th>Товар</th>
                <th>Уник.</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.createdAt.toISOString().slice(0, 19).replace("T", " ")}</td>
                  <td>{e.type}</td>
                  <td>{e.product?.name || "—"}</td>
                  <td>{e.isUnique ? "да" : "нет"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">История бонусов</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Тип</th>
                <th>Комментарий</th>
                <th>Админ</th>
              </tr>
            </thead>
            <tbody>
              {bonuses.map((b) => (
                <tr key={b.id}>
                  <td>{b.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                  <td>
                    {b.amountKzt > 0 ? "+" : ""}
                    {b.amountKzt} ₸
                  </td>
                  <td>{b.kind}</td>
                  <td>{b.comment}</td>
                  <td>{b.adminActor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
