import { SHEET_STATUS } from "../../data/constants.js";

/** Small colored label. tone: neutral | success | warning | info | danger */
export default function Badge({ tone = "neutral", children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function SheetStatusBadge({ status }) {
  const { label, tone } = SHEET_STATUS[status];
  return <Badge tone={tone}>{label}</Badge>;
}
