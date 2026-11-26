import { redirect } from "next/navigation";
import Link from "next/link";
import { getPartnerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { getAppUrl } from "@/lib/settings";
import { CabinetActions } from "./CabinetActions";
import { ProfileForm } from "./ProfileForm";
import { CopyLinkButton } from "./CopyLinkButton";

export default async function CabinetPage() {
  const session = await getPartnerSession();
  if (!session) redirect("/cabinet/login");

  const partner = session.partner;
  const appUrl = getAppUrl();
  const link = `${appUrl}/p/${partner.nick}`;

  const [clicks, leads, attributions, commissions, products] = await Promise.all([
    prisma.click.count({ where: { partnerId: partner.id } }),
    prisma.lead.count({ where: { partnerId: partner.id } }),
    prisma.attribution.count({ where: { partnerId: partner.id } }),
    prisma.commission.findMany({
      where: { partnerId: partner.id },
      include: { order: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const confirmedSum = commissions
    .filter((c) => c.status === "CONFIRMED" || c.status === "PAID")
    .reduce((s, c) => s + c.amountKzt, 0);
  const pendingSum = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((s, c) => s + c.amountKzt, 0);
  const paidSum = commissions
    .filter((c) => c.status === "PAID")
    .reduce((s, c) => s + c.amountKzt, 0);

  return (
    <>
      <SiteHeader />
      <main className="container page-stack">
        <section className="card partner-hero">
          <p className="eyebrow">Кабинет партнёра</p>
          <h1 className="page-title" style={{ marginTop: "0.35rem" }}>
            Привет, {partner.name}
          </h1>
          <div className="partner-meta">
            <span className="chip">@{partner.nick}</span>
            <span
              className={`badge ${
                partner.status === "APPROVED"
                  ? "badge-ok"
                  : partner.status === "BLOCKED"
                    ? "badge-bad"
                    : "badge-warn"
              }`}
            >
              {partner.status}
            </span>
          </div>
        </section>

        {partner.status !== "APPROVED" && (
          <div className="card" style={{ background: "var(--bg-warm)" }}>
            Страница ещё не активна. После одобрения админом ссылка заработает.
          </div>
        )}

        <section className="panel">
          <h2 className="section-title">Мои ссылки</h2>
          <div className="link-row">
            <div>
              <div className="muted" style={{ fontSize: "0.8rem" }}>
                Общая
              </div>
              <Link href={`/p/${partner.nick}`}>
                <code className="break-all">{link}</code>
              </Link>
            </div>
            <CopyLinkButton value={link} />
          </div>
          <CabinetActions link={link} />
          <div className="product-links">
            {products.map((p) => {
              const url = `${appUrl}/p/${partner.nick}/${p.slug}`;
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

        <section className="stats-grid">
          {[
            ["Переходы", clicks],
            ["Лиды", leads],
            ["Заказы", attributions],
            ["Комиссия ₸", confirmedSum],
            ["Ожидает ₸", pendingSum],
            ["Выплачено ₸", paidSum],
          ].map(([label, value]) => (
            <div key={String(label)} className="card stat-card">
              <div className="muted" style={{ fontSize: "0.8rem" }}>
                {label}
              </div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </section>

        {commissions.length > 0 && (
          <section className="panel">
            <h2 className="section-title">Последние начисления</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Заказ</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id}>
                      <td>{c.createdAt.toISOString().slice(0, 10)}</td>
                      <td>
                        <code>{c.order.code || c.order.kaspiId}</code>
                      </td>
                      <td>{c.amountKzt.toLocaleString("ru-KZ")} ₸</td>
                      <td>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="panel">
          <h2 className="section-title">Профиль и реквизиты</h2>
          <p className="muted" style={{ marginTop: 0, marginBottom: "1rem" }}>
            Реквизиты нужны до первой выплаты. Покупатели их не видят.
          </p>
          <ProfileForm
            bio={partner.bio || ""}
            iin={partner.iin || ""}
            payoutRequisites={partner.payoutRequisites || ""}
          />
        </section>
      </main>
    </>
  );
}
