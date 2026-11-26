"use client";

import { useEffect } from "react";

/** Records OPEN when ?ref= is present; sets last-touch cookie via API. */
export function TrackReferral({
  refCode,
  productSlug,
}: {
  refCode?: string | null;
  productSlug?: string;
}) {
  useEffect(() => {
    if (!refCode) return;
    void fetch("/api/referral/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: refCode, productSlug, source: "product_page" }),
      credentials: "same-origin",
    });
  }, [refCode, productSlug]);

  return null;
}
