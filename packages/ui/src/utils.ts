/** Tiny classnames joiner so we don't need a dependency for it. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Formats a decimal price as BRL currency. Both apps show prices this way. */
export function formatPrice(value: number | string): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  return numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
