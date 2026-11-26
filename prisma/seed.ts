import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Послеродовые трусики Premium, 5 шт",
    slug: "panties-postpartum",
    sku: "162360944",
    kaspiUrl:
      "https://kaspi.kz/shop/p/coco-s-menstrual-nye-trusiki-premium-5-sht-162360944/?c=750000000",
    priceKzt: 2900,
    imageUrl: "/landing/assets/products/panties-postpartum.jpg",
    description: "3 одноразовых трусов XL + 2 подгузника для взрослых — на схватки и первые дни.",
    sortOrder: 1,
  },
  {
    name: "Ночные прокладки Premium 420 мм, 4 шт",
    slug: "night-420",
    sku: "163279647",
    kaspiUrl:
      "https://kaspi.kz/shop/p/coco-s-prokladki-premium-4-sht-163279647/?c=750000000",
    priceKzt: 950,
    imageUrl: "/landing/assets/products/night-420.jpg",
    description: "Ночные прокладки 420 мм из медицинского хлопка.",
    sortOrder: 2,
  },
  {
    name: "Ночные прокладки Premium 340 мм, 6 шт",
    slug: "night-340",
    sku: "163279643",
    kaspiUrl:
      "https://kaspi.kz/shop/p/coco-s-prokladki-premium-6-sht-163279643/?c=750000000",
    priceKzt: 950,
    imageUrl: "/landing/assets/products/night-340.jpg",
    description: "Ночные прокладки 340 мм.",
    sortOrder: 3,
  },
  {
    name: "Дневные прокладки Premium 245 мм, 8 шт",
    slug: "day-245",
    sku: "164665176",
    kaspiUrl:
      "https://kaspi.kz/shop/p/coco-s-prokladki-premium-8-sht-164665176/?c=750000000",
    priceKzt: 1140,
    imageUrl: "/landing/assets/products/day-245.jpg",
    description: "Дневные прокладки 245 мм.",
    sortOrder: 4,
  },
  {
    name: "Дневные прокладки Premium 280 мм, 8 шт",
    slug: "day-280",
    sku: "163123169",
    kaspiUrl:
      "https://kaspi.kz/shop/p/coco-s-prokladki-premium-8-sht-163123169/?c=750000000",
    priceKzt: 1140,
    imageUrl: "/landing/assets/products/day-280.jpg",
    description: "Дневные прокладки 280 мм.",
    sortOrder: 5,
  },
  {
    name: "Ежедневные прокладки Premium, 20 шт",
    slug: "daily-20",
    sku: "163123808",
    kaspiUrl:
      "https://kaspi.kz/shop/p/coco-s-prokladki-ezhednevnye-premium-20-sht-163123808/?c=750000000",
    priceKzt: 1050,
    imageUrl: "/landing/assets/products/daily-20.jpg",
    description: "Ежедневные прокладки, 20 шт.",
    sortOrder: 6,
  },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: p,
      update: p,
    });
  }

  await prisma.partner.upsert({
    where: { nick: "aigerim" },
    create: {
      name: "Айгерим (demo)",
      phone: "77001112233",
      city: "Алматы",
      nick: "aigerim",
      instagram: "@aigerim.demo",
      bio: "Мама из Алматы. Рекомендую то, чем пользуюсь сама.",
      status: "APPROVED",
      commissionRate: 15,
      approvedAt: new Date(),
      agreedAt: new Date(),
    },
    update: {
      status: "APPROVED",
      approvedAt: new Date(),
    },
  });

  await prisma.setting.upsert({
    where: { key: "attribution_phone_days" },
    create: { key: "attribution_phone_days", value: "30" },
    update: {},
  });
  await prisma.setting.upsert({
    where: { key: "default_commission_rate" },
    create: { key: "default_commission_rate", value: "15" },
    update: {},
  });

  console.log("Seed OK: products + demo partner @aigerim / 77001112233");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
