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

  async function upsertClient(data: {
    nick: string;
    referralCode: string;
    name: string;
    phone: string;
    email: string;
    city: string;
    bio?: string;
  }) {
    const byCode = await prisma.partner.findUnique({
      where: { referralCode: data.referralCode },
    });
    const byNick = await prisma.partner.findUnique({ where: { nick: data.nick } });
    const byPhone = await prisma.partner.findUnique({ where: { phone: data.phone } });
    const existing = byCode || byNick || byPhone;
    if (existing) {
      await prisma.partner.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          city: data.city,
          nick: data.nick,
          referralCode: data.referralCode,
          bio: data.bio,
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });
      return;
    }
    await prisma.partner.create({
      data: {
        ...data,
        status: "APPROVED",
        commissionRate: 15,
        approvedAt: new Date(),
        agreedAt: new Date(),
      },
    });
  }

  await upsertClient({
    nick: "aigerim",
    referralCode: "COCO001",
    name: "Айгерим (demo)",
    phone: "77001112233",
    email: "aigerim@demo.cocos.kz",
    city: "Алматы",
    bio: "Мама из Алматы. Рекомендую то, чем пользуюсь сама.",
  });

  await upsertClient({
    nick: "dana",
    referralCode: "COCO002",
    name: "Дана (demo)",
    phone: "77002223344",
    email: "dana@demo.cocos.kz",
    city: "Астана",
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

  console.log(
    "Seed OK: products + clients COCO001/77001112233 + COCO002/77002223344 (SMS code 000000)",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
