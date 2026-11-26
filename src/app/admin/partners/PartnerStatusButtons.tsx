"use client";

import { useRouter } from "next/navigation";

export function PartnerStatusButtons({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();

  async function setStatus(next: "APPROVED" | "BLOCKED" | "PENDING") {
    await fetch(`/api/admin/partners/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <div className="admin-actions">
      {status !== "APPROVED" && (
        <button type="button" className="btn btn-primary btn-xs" onClick={() => setStatus("APPROVED")}>
          Одобрить
        </button>
      )}
      {status !== "BLOCKED" && (
        <button type="button" className="btn btn-ghost btn-xs" onClick={() => setStatus("BLOCKED")}>
          Блок
        </button>
      )}
    </div>
  );
}
