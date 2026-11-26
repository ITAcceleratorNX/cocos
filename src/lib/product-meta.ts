/** UI helpers for product PDP chips / breadcrumbs (no schema change). */

export function productCategoryLabel(name: string) {
  const n = name.toLowerCase();
  if (n.includes("трусик")) return "Послеродовой уход";
  if (n.includes("ежеднев")) return "Ежедневные";
  if (n.includes("ночн")) return "Ночные прокладки";
  if (n.includes("дневн")) return "Дневные прокладки";
  return "Гигиенические средства";
}

export function productVariantLabel(name: string) {
  const n = name.toLowerCase();
  if (n.includes("трусик")) return "Трусики";
  if (n.includes("ежеднев")) return "Ежедневные";
  if (n.includes("420")) return "Ночные 420 мм";
  if (n.includes("340")) return "Ночные 340 мм";
  if (n.includes("245")) return "Дневные 245 мм";
  if (n.includes("280")) return "Дневные 280 мм";
  if (n.includes("ночн")) return "Ночные";
  if (n.includes("дневн")) return "Дневные";
  return name.slice(0, 28);
}

export function productPerkChips(name: string): string[] {
  const chips = ["100% медицинский хлопок"];
  const size = name.match(/(\d+)\s*мм/i);
  const count = name.match(/(\d+)\s*шт/i);
  const n = name.toLowerCase();

  if (size && n.includes("ночн")) chips.push(`${size[1]} мм · ночные`);
  else if (size && n.includes("дневн")) chips.push(`${size[1]} мм · дневные`);
  else if (size) chips.push(`${size[1]} мм`);

  if (count) chips.push(`${count[1]} шт в упаковке`);
  chips.push("Оплата и доставка через Kaspi");
  return chips;
}
