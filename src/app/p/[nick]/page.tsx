import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { PhoneLeadForm } from "@/components/PhoneLeadForm";
import { TrackVisit } from "@/components/TrackVisit";

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ nick: string }>;
}) {
  const { nick } = await params;
  const partner = await prisma.partner.findUnique({
    where: { nick: nick.toLowerCase() },
  });
  if (!partner || partner.status !== "APPROVED") notFound();

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const first = products[0];

  return (
    <>
      <TrackVisit nick={partner.nick} source="partner_page" />
      <SiteHeader />
      <main className="container page-stack">
        <section className="card partner-hero">
          <p className="eyebrow">Рекомендует</p>
          <h1 className="page-title" style={{ marginTop: "0.4rem" }}>
            {partner.name}
          </h1>
          {partner.bio ? (
            <p className="muted" style={{ margin: "0.55rem 0 0", maxWidth: 520 }}>
              {partner.bio}
            </p>
          ) : (
            <p className="muted" style={{ margin: "0.55rem 0 0", maxWidth: 520 }}>
              Премиальный хлопок CoCo’s — мягкая защита с роддома и каждый месяц после.
            </p>
          )}
          <div className="partner-meta">
            <span className="chip">@{partner.nick}</span>
            {partner.city && <span className="chip">{partner.city}</span>}
            <span className="chip">Покупка на Kaspi</span>
          </div>
        </section>

        {first && (
          <PhoneLeadForm
            partnerNick={partner.nick}
            productSlug={first.slug}
            kaspiUrl={first.kaspiUrl}
            goPath={`/go/${partner.nick}/${first.slug}`}
          />
        )}

        <section>
          <h2 className="section-title">Каталог CoCo’s</h2>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                href={`/p/${partner.nick}/${product.slug}`}
                ctaHref={`/p/${partner.nick}/${product.slug}`}
                ctaLabel="Выбрать"
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
