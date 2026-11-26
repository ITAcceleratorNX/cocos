"use client";

export function CabinetActions({ link }: { link: string }) {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/cabinet/login";
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <a
        className="btn btn-ghost"
        href={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(link)}`}
        target="_blank"
        rel="noreferrer"
      >
        QR
      </a>
      <button type="button" className="btn btn-ghost" onClick={logout}>
        Выйти
      </button>
    </div>
  );
}
