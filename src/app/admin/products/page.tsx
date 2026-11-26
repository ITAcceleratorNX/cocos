import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductManager } from "./ProductForm";

export default async function AdminProductsPage() {
  if (!(await getAdminSession())) redirect("/admin/login");
  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <main className="page-stack">
      <div className="admin-page-head">
        <div>
          <h1 className="page-title">Каталог</h1>
          <p className="muted" style={{ margin: 0 }}>
            SKU, цена, ссылка Kaspi · выключенный товар скрыт со страниц партнёров
          </p>
        </div>
      </div>
      <ProductManager products={products} />
    </main>
  );
}
