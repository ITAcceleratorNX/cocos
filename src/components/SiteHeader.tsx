"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function SiteHeader({
  compact = false,
  authed = false,
}: {
  compact?: boolean;
  authed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!accountRef.current?.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="site-header" data-compact={compact || undefined}>
      <div className="container header-inner">
        <Link
          href="/"
          className="brand"
          onClick={() => {
            setOpen(false);
            setAccountOpen(false);
          }}
        >
          <span className="brand-flower" aria-hidden>
            ✿
          </span>
          <span className="brand-mark">CoCo’s</span>
          <span className="brand-tag">Premium Cotton</span>
        </Link>

        <nav className="header-nav desktop-nav" aria-label="Навигация">
          <Link href="/#catalog">Каталог</Link>
          {authed ? (
            <Link href="/cabinet" className="btn btn-primary btn-sm">
              Кабинет
            </Link>
          ) : (
            <div className="header-account" ref={accountRef}>
              <button
                type="button"
                className="btn btn-primary btn-sm header-account__trigger"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                onClick={() => setAccountOpen((v) => !v)}
              >
                Регистрация
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {accountOpen && (
                <div className="header-account__menu" role="menu">
                  <Link
                    href="/cabinet/login"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                  >
                    Войти
                  </Link>
                  <Link
                    href="/partner"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          )}
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
          {authed ? (
            <Link
              href="/cabinet"
              className="btn btn-primary btn-block"
              style={{ marginTop: 8 }}
              onClick={() => setOpen(false)}
            >
              Кабинет
            </Link>
          ) : (
            <div className="mobile-account">
              <p className="mobile-account__label">Аккаунт</p>
              <Link href="/cabinet/login" onClick={() => setOpen(false)}>
                Войти
              </Link>
              <Link
                href="/partner"
                className="btn btn-primary btn-block"
                style={{ marginTop: 8 }}
                onClick={() => setOpen(false)}
              >
                Регистрация
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
