import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await getAdminSession();

  if (!ok) {
    return <div className="admin-shell admin-shell--guest">{children}</div>;
  }

  return (
    <div className="admin-shell">
      <AdminNav />
      <div className="admin-content">{children}</div>
    </div>
  );
}
