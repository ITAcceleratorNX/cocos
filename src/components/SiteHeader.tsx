"use client";

import Link from "next/link";
import { useState } from "react";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header" data-compact={compact || undefined}>
      <div className="container header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-flower" aria-hidden>
            ✿
          </span>
          <span className="brand-mark">CoCo’s</span>
          <span className="brand-tag">Premium Cotton</span>
        </Link>

        <nav className="header-nav desktop-nav" aria-label="Навигация">
          <Link href="/#catalog">Каталог</Link>
          <Link href="/partner">Регистрация</Link>
          <Link href="/cabinet/login">Войти</Link>
          <Link href="/cabinet" className="btn btn-primary btn-sm">
            Кабинет
          </Link>
        </nav>

        <button
          type="button"
          className="burger"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <nav className="mobile-nav container" aria-label="Мобильная навигация">
          <Link href="/#catalog" onClick={() => setOpen(false)}>
            Каталог
          </Link>
          <Link href="/partner" onClick={() => setOpen(false)}>
            Регистрация
          </Link>
          <Link href="/cabinet/login" onClick={() => setOpen(false)}>
            Войти
          </Link>
          <Link
            href="/cabinet"
            className="btn btn-primary btn-block"
            style={{ marginTop: 8 }}
            onClick={() => setOpen(false)}
          >
            Кабинет
          </Link>
        </nav>
      )}
    </header>
  );
}
