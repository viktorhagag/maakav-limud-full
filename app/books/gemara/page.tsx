// app/books/gemara/page.tsx
"use client";

import Link from "next/link";
import * as gp from "@/lib/gemaraPages";

type Item = { id: string; title: string };

// יוצג אם אין נתונים מהlib (כדי שלא יהיה מסך ריק)
const FALLBACK: Item[] = [
  { id: "berakhot", title: "ברכות" },
  { id: "shabbat", title: "שבת" },
  { id: "eruvin", title: "עירובין" },
  { id: "pesachim", title: "פסחים" },
  { id: "yoma", title: "יומא" },
  { id: "sukkah", title: "סוכה" },
];

function getMasechtot(): Item[] {
  const anygp: any = gp as any;
  const candidate =
    anygp.masechtot ||
    anygp.MASECHTOT ||
    anygp.list ||
    anygp.LIST ||
    anygp.default ||
    [];

  const arr: Item[] = Array.isArray(candidate)
    ? candidate.map((x: any) => ({
        id: String(x.id ?? x.slug ?? x.key ?? x.name ?? ""),
        title: String(x.title ?? x.name ?? x.label ?? x.id ?? ""),
      }))
    : [];

  const cleaned = arr.filter((x) => x.id && x.title);
  return cleaned.length ? cleaned : FALLBACK;
}

export default function Page() {
  const masechtot = getMasechtot();

  return (
    <div className="grid grid-cols-2 gap-4">
      {masechtot.map(({ id, title }) => (
        <Link
          key={id}
          href={{ pathname: "/books/gemara/[id]", query: { id } }}
          className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-6 text-lg font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {title}
        </Link>
      ))}
    </div>
  );
}
