import Link from "next/link";

type Product = {
  name: string;
  slug: string;
  priceKzt: number;
  imageUrl: string | null;
  description?: string | null;
};

export function ProductCard({
  product,
  href,
  ctaHref,
  ctaLabel = "Купить в Kaspi",
}: {
  product: Product;
  href: string;
  ctaHref: string;
  ctaLabel?: string;
}) {
  return (
    <article className="card product-card">
      <Link href={href}>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="product-card__img" />
        ) : (
          <div className="product-card__img product-card__img--empty" />
        )}
      </Link>
      <div>
        <Link href={href} className="product-card__title">
          {product.name}
        </Link>
        <div className="product-card__price">{product.priceKzt.toLocaleString("ru-KZ")} ₸</div>
      </div>
      <a className="btn btn-primary btn-sm" href={ctaHref}>
        {ctaLabel}
      </a>
    </article>
  );
}
