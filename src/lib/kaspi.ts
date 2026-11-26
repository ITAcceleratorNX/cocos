/**
 * Kaspi Shop API client (Stage 0/2).
 * Docs: merchant guide — orders list with customer.cellPhone.
 * Token must stay server-side only.
 */

export type KaspiOrderDto = {
  id: string;
  code?: string;
  status: string;
  totalPrice: number;
  creationDate?: number;
  customer?: {
    firstName?: string;
    lastName?: string;
    cellPhone?: string;
  };
  entries?: Array<{
    product?: { code?: string; name?: string };
    quantity?: number;
    totalPrice?: number;
  }>;
};

function getBaseUrl() {
  return process.env.KASPI_API_BASE || "https://kaspi.kz/shop/api/v2";
}

function getToken() {
  const token = process.env.KASPI_API_TOKEN;
  if (!token) throw new Error("KASPI_API_TOKEN is empty");
  return token;
}

export async function fetchKaspiOrders(params?: {
  page?: number;
  size?: number;
  state?: string;
}): Promise<{ data: KaspiOrderDto[]; raw: unknown }> {
  const page = params?.page ?? 0;
  const size = params?.size ?? 20;
  const url = new URL(`${getBaseUrl()}/orders`);
  url.searchParams.set("page[number]", String(page));
  url.searchParams.set("page[size]", String(size));
  if (params?.state) url.searchParams.set("filter[orders][state]", params.state);

  const res = await fetch(url, {
    headers: {
      "X-Auth-Token": getToken(),
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kaspi API ${res.status}: ${text.slice(0, 500)}`);
  }

  const raw = await res.json();
  const data = (raw.data || []).map((item: { id: string; attributes?: Record<string, unknown> }) => {
    const a = item.attributes || {};
    return {
      id: String(item.id),
      code: a.code as string | undefined,
      status: String(a.status || a.state || "OTHER"),
      totalPrice: Number(a.totalPrice || 0),
      creationDate: a.creationDate as number | undefined,
      customer: a.customer as KaspiOrderDto["customer"],
      entries: a.entries as KaspiOrderDto["entries"],
    } satisfies KaspiOrderDto;
  });

  return { data, raw };
}

/** Quick Stage 0 probe: token works + cellPhone present? */
export async function probeKaspiApi() {
  const { data, raw } = await fetchKaspiOrders({ page: 0, size: 5 });
  const withPhone = data.filter((o) => !!o.customer?.cellPhone);
  return {
    ok: true,
    ordersSampled: data.length,
    withCellPhone: withPhone.length,
    sample: data.slice(0, 3).map((o) => ({
      id: o.id,
      code: o.code,
      status: o.status,
      totalPrice: o.totalPrice,
      hasPhone: !!o.customer?.cellPhone,
      phoneMasked: o.customer?.cellPhone
        ? `${o.customer.cellPhone.slice(0, 4)}***${o.customer.cellPhone.slice(-2)}`
        : null,
    })),
    rawKeys: raw && typeof raw === "object" ? Object.keys(raw as object) : [],
  };
}
