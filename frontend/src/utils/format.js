// Small display helpers.

export const fullName = (person) =>
  person ? [person.lastName, person.firstName, person.middleName].filter(Boolean).join(" ") : "—";

export const shortName = (person) =>
  person ? `${person.lastName} ${person.firstName?.[0] ?? ""}.` : "—";

/** "2026-01-15" → "15.01.2026" */
export function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** { key: "Label" } or { key: { label } } → [{ value, label }] for <select>s. */
export const toOptions = (obj) => Object.entries(obj).map(([value, v]) => ({ value, label: v.label ?? v }));

/** Case-insensitive "contains" check for search boxes. */
export const matches = (text, query) =>
  String(text ?? "").toLowerCase().includes(query.trim().toLowerCase());
