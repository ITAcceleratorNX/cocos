"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "./AdminLogoutButton";

const links = [
  { href: "/admin", label: "Дашборд", exact: true },
  { href: "/admin/partners", label: "Партнёры" },
  { href: "/admin/products", label: "Каталог" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/payouts", label: "Выплаты" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="admin-navbar">
      <div className="admin-navbar__inner">
        <Link href="/admin" className="admin-navbar__brand">
          <span className="brand-flower" aria-hidden>
            ✿
          </span>
          <span className="admin-navbar__brand-text">
            CoCo’s <span>Admin</span>
          </span>
        </Link>

        <nav className="admin-navbar__nav" aria-label="Админ-навигация">
          {links.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`admin-navbar__link ${active ? "is-active" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-navbar__actions">
          <Link href="/" className="admin-navbar__site">
            На сайт
          </Link>
          <AdminLogoutButton />
        </div>
      </div>
    </header>
  );
}
