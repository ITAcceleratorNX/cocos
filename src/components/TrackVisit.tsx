"use client";

import { useEffect } from "react";

export function TrackVisit({
  nick,
  productSlug,
  source,
}: {
  nick: string;
  productSlug?: string;
  source: string;
}) {
  useEffect(() => {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nick, productSlug, source }),
    });
  }, [nick, productSlug, source]);

  return null;
}
