import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { PhoneLeadForm } from "@/components/PhoneLeadForm";
import { TrackVisit } from "@/components/TrackVisit";

export default async function PartnerProductPage({
  params,
}: {
  params: Promise<{ nick: string; product: string }>;
}) {
  const { nick, product: productSlug } = await params;
  const partner = await prisma.partner.findUnique({
    where: { nick: nick.toLowerCase() },
  });
  const product = await prisma.product.findUnique({ where: { slug: productSlug } });
  if (!partner || partner.status !== "APPROVED" || !product || !product.active) notFound();

  return (
    <>
      <TrackVisit nick={partner.nick} productSlug={product.slug} source="partner_product" />
      <SiteHeader />
      <main className="container page-stack">
        <Link href={`/p/${partner.nick}`} className="back-link">
          ← {partner.name}
        </Link>

        <div className="product-detail">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-detail__media"
            />
          ) : (
            <div className="product-detail__media" />
          )}

          <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
            <div>
              <p className="eyebrow">Рекомендация @{partner.nick}</p>
              <h1 className="page-title" style={{ marginTop: "0.35rem" }}>
                {product.name}
              </h1>
              <div
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 700,
                  color: "var(--brand-gold)",
                  marginTop: "0.35rem",
                }}
              >
                {product.priceKzt.toLocaleString("ru-KZ")} ₸
              </div>
              {product.description && (
                <p className="muted" style={{ marginTop: "0.75rem" }}>
                  {product.description}
                </p>
              )}
            </div>

            <PhoneLeadForm
              partnerNick={partner.nick}
              productSlug={product.slug}
              kaspiUrl={product.kaspiUrl}
              goPath={`/go/${partner.nick}/${product.slug}`}
            />
          </div>
        </div>
      </main>
    </>
  );
}
