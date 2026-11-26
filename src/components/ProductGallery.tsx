"use client";

import { useState } from "react";

export function ProductGallery({
  name,
  images,
}: {
  name: string;
  images: string[];
}) {
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const current = list[active] || list[0];

  return (
    <div className="pdp-gallery">
      <div className="pdp-gallery__stage">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={name} className="pdp-gallery__media" />
        ) : (
          <div className="pdp-gallery__media pdp-gallery__media--empty" />
        )}
      </div>

      {list.length > 1 && (
        <div className="pdp-gallery__thumbs" role="tablist" aria-label="Фото товара">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`pdp-gallery__thumb ${i === active ? "is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
