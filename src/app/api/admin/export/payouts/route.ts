import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where = {
    status: "CONFIRMED" as const,
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const commissions = await prisma.commission.findMany({
    where,
    include: {
      partner: true,
      order: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Aggregate by partner
  const byPartner = new Map<
    string,
    {
      partner: (typeof commissions)[0]["partner"];
      amount: number;
      orders: number;
    }
  >();

  for (const c of commissions) {
    const row = byPartner.get(c.partnerId) || {
      partner: c.partner,
      amount: 0,
      orders: 0,
    };
    row.amount += c.amountKzt;
    row.orders += 1;
    byPartner.set(c.partnerId, row);
  }

  const workbook = new ExcelJS.Workbook();
  const summary = workbook.addWorksheet("К выплате");
  summary.columns = [
    { header: "Партнёр", key: "name", width: 24 },
    { header: "Nick", key: "nick", width: 16 },
    { header: "Телефон", key: "phone", width: 16 },
    { header: "ИИН", key: "iin", width: 16 },
    { header: "Реквизиты", key: "req", width: 32 },
    { header: "Заказов", key: "orders", width: 10 },
    { header: "Сумма ₸", key: "amount", width: 12 },
  ];

  for (const row of byPartner.values()) {
    summary.addRow({
      name: row.partner.name,
      nick: row.partner.nick,
      phone: row.partner.phone,
      iin: row.partner.iin || "",
      req: row.partner.payoutRequisites || "",
      orders: row.orders,
      amount: row.amount,
    });
  }

  const detail = workbook.addWorksheet("Детализация");
  detail.columns = [
    { header: "Дата", key: "date", width: 14 },
    { header: "Партнёр", key: "partner", width: 20 },
    { header: "Kaspi ID", key: "kaspiId", width: 18 },
    { header: "Код заказа", key: "code", width: 14 },
    { header: "Сумма заказа", key: "total", width: 14 },
    { header: "Ставка %", key: "rate", width: 10 },
    { header: "Комиссия ₸", key: "amount", width: 12 },
    { header: "Статус", key: "status", width: 12 },
  ];

  for (const c of commissions) {
    detail.addRow({
      date: c.createdAt.toISOString().slice(0, 10),
      partner: c.partner.nick,
      kaspiId: c.order.kaspiId,
      code: c.order.code || "",
      total: c.order.totalPrice,
      rate: Number(c.rate),
      amount: c.amountKzt,
      status: c.status,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="cocos-payouts.xlsx"`,
    },
  });
}
