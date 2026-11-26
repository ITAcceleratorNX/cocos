import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppUrl().replace(/\/$/, "");
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/partner`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/offer`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const { prisma } = await import("@/lib/prisma");
    const [products, partners] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.partner.findMany({
        where: { status: "APPROVED" },
        select: { nick: true, updatedAt: true },
      }),
    ]);

    return [
      ...staticRoutes,
      ...products.map((p) => ({
        url: `${base}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...partners.map((p) => ({
        url: `${base}/p/${p.nick}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
