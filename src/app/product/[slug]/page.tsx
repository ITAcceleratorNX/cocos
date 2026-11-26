import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { TrackReferral } from "@/components/TrackReferral";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { slug } = await params;
  const { ref } = await searchParams;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.active) notFound();

  const kaspiHref = ref
    ? `/go/kaspi/${product.slug}?ref=${encodeURIComponent(ref)}`
    : `/go/kaspi/${product.slug}`;

  return (
    <>
      <TrackReferral refCode={ref} productSlug={product.slug} />
      <SiteHeader />
      <main className="container page-stack">
        <Link href="/#catalog" className="back-link">
          ← В каталог
        </Link>

        <div className="product-detail">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="product-detail__media" />
          ) : (
            <div className="product-detail__media" />
          )}

          <div className="panel" style={{ alignSelf: "start" }}>
            <p className="eyebrow">CoCo’s Premium Cotton</p>
            <h1 className="page-title" style={{ marginTop: "0.35rem" }}>
              {product.name}
            </h1>
            <div
              style={{
                fontSize: "1.45rem",
                fontWeight: 700,
                color: "var(--brand-gold)",
                margin: "0.5rem 0 0.85rem",
              }}
            >
              {product.priceKzt.toLocaleString("ru-KZ")} ₸
            </div>
            {product.description && <p className="muted">{product.description}</p>}
            <a className="btn btn-primary btn-block" href={kaspiHref} style={{ marginTop: 8 }}>
              Купить в Kaspi
            </a>
            <p className="muted" style={{ margin: "0.75rem 0 0", fontSize: "0.85rem" }}>
              Оплата и доставка — через Kaspi Магазин. Переход фиксируется до ухода с сайта.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
