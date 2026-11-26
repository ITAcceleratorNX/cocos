import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPartnerSession } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { TrackReferral } from "@/components/TrackReferral";
import { ProductGallery } from "@/components/ProductGallery";
import {
  productCategoryLabel,
  productPerkChips,
  productVariantLabel,
} from "@/lib/product-meta";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { slug } = await params;
  const { ref } = await searchParams;

  const [product, catalog, session] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    getPartnerSession().catch(() => null),
  ]);

  if (!product || !product.active) notFound();

  const kaspiHref = ref
    ? `/go/kaspi/${product.slug}?ref=${encodeURIComponent(ref)}`
    : `/go/kaspi/${product.slug}`;

  const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const price = product.priceKzt.toLocaleString("ru-KZ");
  const category = productCategoryLabel(product.name);
  const perks = productPerkChips(product.name);
  const related = catalog.filter((p) => p.id !== product.id).slice(0, 4);
  const variants = catalog.slice(0, 6);

  const images = product.imageUrl ? [product.imageUrl] : [];

  return (
    <>
      <TrackReferral refCode={ref} productSlug={product.slug} />
      <SiteHeader authed={Boolean(session)} />

      <main className="product-page">
        <div className="container product-page__shell">
          <nav className="pdp-crumbs" aria-label="Хлебные крошки">
            <Link href="/#catalog">Каталог</Link>
            <span aria-hidden>/</span>
            <span>Гигиенические средства</span>
            <span aria-hidden>/</span>
            <span className="pdp-crumbs__current">{category}</span>
          </nav>

          <section className="pdp-grid">
            <div className="pdp-grid__media">
              <ProductGallery name={product.name} images={images} />
            </div>

            <div className="pdp-grid__info">
              <div className="pdp-buy">
                <p className="pdp-buy__brand">CoCo&apos;s Premium Cotton</p>
                <h1 className="pdp-buy__title">{product.name}</h1>

                <div className="pdp-buy__price-row">
                  <span className="pdp-buy__price">{price} ₸</span>
                  <span className="pdp-buy__kaspi-badge">Цена в Kaspi Магазине</span>
                </div>

                {product.description && (
                  <p className="pdp-buy__desc">{product.description}</p>
                )}

                <div className="pdp-chips" aria-label="Преимущества">
                  {perks.map((chip) => (
                    <span key={chip} className="pdp-chip">
                      <span className="pdp-chip__dot" aria-hidden />
                      {chip}
                    </span>
                  ))}
                </div>

                {variants.length > 1 && (
                  <div className="pdp-variants">
                    <p className="pdp-variants__label">Вариант</p>
                    <div className="pdp-variants__list">
                      {variants.map((v) => {
                        const active = v.id === product.id;
                        const href = `/product/${v.slug}${refQuery}`;
                        return active ? (
                          <span key={v.id} className="pdp-variant is-active">
                            {productVariantLabel(v.name)}
                          </span>
                        ) : (
                          <Link key={v.id} href={href} className="pdp-variant">
                            {productVariantLabel(v.name)}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                <a className="pdp-cta" href={kaspiHref}>
                  <span>Купить в Kaspi</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M7 17L17 7M17 7H9M17 7V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                <p className="pdp-buy__fineprint">
                  Откроется Kaspi Магазин. Переход учитывается в статистике.
                </p>
              </div>
            </div>
          </section>

          {related.length > 0 && (
            <section className="pdp-related">
              <div className="pdp-related__head">
                <h2>Другие товары линейки</h2>
                <Link href="/#catalog">Весь каталог</Link>
              </div>
              <div className="pdp-related__grid">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}${refQuery}`}
                    className="pdp-related__card"
                  >
                    <div className="pdp-related__img-wrap">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.name} />
                      ) : (
                        <div className="pdp-related__img-empty" />
                      )}
                    </div>
                    <div className="pdp-related__meta">
                      <span className="pdp-related__name">{p.name}</span>
                      <span className="pdp-related__price">
                        {p.priceKzt.toLocaleString("ru-KZ")} ₸
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
