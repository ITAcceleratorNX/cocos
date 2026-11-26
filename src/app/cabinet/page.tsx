import { redirect } from "next/navigation";
import Link from "next/link";
import { getPartnerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { getAppUrl } from "@/lib/settings";
import { referralStats } from "@/lib/referral";
import { CabinetActions } from "./CabinetActions";
import { ProfileForm } from "./ProfileForm";
import { CopyLinkButton } from "./CopyLinkButton";

export default async function CabinetPage() {
  const session = await getPartnerSession();
  if (!session) redirect("/cabinet/login");

  const partner = session.partner;
  const appUrl = getAppUrl();

  const [stats, products, bonuses, byProduct] = await Promise.all([
    referralStats({ partnerId: partner.id }),
    prisma.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.bonusLedger.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.referralEvent.groupBy({
      by: ["productId", "type"],
      where: { partnerId: partner.id },
      _count: { _all: true },
    }),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="container page-stack">
        <section className="card partner-hero">
          <p className="eyebrow">Кабинет клиента</p>
          <h1 className="page-title" style={{ marginTop: "0.35rem" }}>
            Привет, {partner.name}
          </h1>
          <div className="partner-meta">
            <span className="chip">ID {partner.referralCode}</span>
            <span className="badge badge-ok">Активен</span>
          </div>
          <CabinetActions link={`${appUrl}/product/${products[0]?.slug || "panties-postpartum"}?ref=${partner.referralCode}`} />
        </section>

        <section className="stats-grid">
          {[
            ["Открытия ссылок", stats.opens],
            ["Уникальные", stats.uniqueOpens],
            ["Повторные", stats.repeatOpens],
            ["Переходы в Kaspi", stats.kaspiClicks],
            ["Бонусы ₸", partner.bonusBalance],
          ].map(([label, value]) => (
            <div key={String(label)} className="card stat-card">
              <div className="muted" style={{ fontSize: "0.8rem" }}>
                {label}
              </div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2 className="section-title">Реферальные ссылки на товары</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Скопируйте ссылку и отправьте в WhatsApp / Instagram. Покупка в Kaspi не обязательна для учёта перехода.
          </p>
          <div className="product-links">
            {products.map((p) => {
              const url = `${appUrl}/product/${p.slug}?ref=${partner.referralCode}`;
              return (
                <div key={p.id} className="link-row">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.name}</div>
                    <code className="break-all" style={{ fontSize: "0.75rem" }}>
                      {url}
                    </code>
                  </div>
                  <CopyLinkButton value={url} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <h2 className="section-title">По товарам</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Открытия</th>
                  <th>Kaspi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const opens = byProduct
                    .filter((r) => r.productId === p.id && r.type === "OPEN")
                    .reduce((s, r) => s + r._count._all, 0);
                  const kaspi = byProduct
                    .filter((r) => r.productId === p.id && r.type === "KASPI_CLICK")
                    .reduce((s, r) => s + r._count._all, 0);
                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{opens}</td>
                      <td>{kaspi}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2 className="section-title">История бонусов</h2>
          {bonuses.length === 0 ? (
            <p className="muted">Пока пусто — бонусы начисляет администратор вручную.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Сумма</th>
                    <th>Тип</th>
                    <th>Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {bonuses.map((b) => (
                    <tr key={b.id}>
                      <td>{b.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                      <td>
                        {b.amountKzt > 0 ? "+" : ""}
                        {b.amountKzt.toLocaleString("ru-KZ")} ₸
                      </td>
                      <td>{b.kind}</td>
                      <td>{b.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <h2 className="section-title">Профиль</h2>
          <ProfileForm
            bio={partner.bio || ""}
            iin={partner.iin || ""}
            payoutRequisites={partner.payoutRequisites || ""}
          />
          <p className="muted" style={{ marginTop: "1rem" }}>
            <Link href="/">На главную</Link>
          </p>
        </section>
      </main>
    </>
  );
}
