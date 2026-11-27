"use client";

import { useState } from "react";

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // insecure context (http://IP) — fall through
    }
  }

  const ta = document.createElement("textarea");
  ta.value = value;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export function CopyLinkButton({ value, label = "Копировать" }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);

  async function copy() {
    setErr(false);
    try {
      await copyText(value);
      setOk(true);
      setTimeout(() => setOk(false), 1200);
    } catch {
      setErr(true);
      setTimeout(() => setErr(false), 2000);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-ghost"
      style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem", flexShrink: 0 }}
      onClick={copy}
    >
      {err ? "Ошибка" : ok ? "Скопировано" : label}
    </button>
  );
}
