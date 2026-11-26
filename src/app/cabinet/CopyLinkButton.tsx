"use client";

import { useState } from "react";

export function CopyLinkButton({ value, label = "Копировать" }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setOk(true);
    setTimeout(() => setOk(false), 1200);
  }

  return (
    <button
      type="button"
      className="btn btn-ghost"
      style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem", flexShrink: 0 }}
      onClick={copy}
    >
      {ok ? "OK" : label}
    </button>
  );
}
