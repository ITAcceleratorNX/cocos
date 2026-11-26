"use client";

export function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button type="button" className="admin-navbar__logout" onClick={logout}>
      Выйти
    </button>
  );
}
