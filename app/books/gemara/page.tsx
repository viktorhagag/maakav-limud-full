// app/books/gemara./page.tsx
"use client";

import Link from "next/link";

// 👉 עדכן כאן את שם היצוא אם אצלך הוא לא 'masechtot'
import { masechtot as data } from "@/lib/gemaraPages";

type Item = { id: string; title: string };

const fallback: Item[] = [
  { id: "berakhot", title: "ברכות" },
  { id: "shabbat", title: "שבת" },
  { id: "eruvin", title: "עירובין" },
];

export default function Page() {
  const list: Item[] =
    (Array.isArray(data) ? data : []).map((x: any) => ({
      id: String(x.id ?? x.slug ?? x.key ?? ""),
      title: String(x.title ?? x.name ?? x.label ?? x.id ?? ""),
    })).filter((x) => x.id && x.title) || fallback;

  return (
    <div className="grid grid-cols-2 gap-4">
      {list.map(({ id, title }) => (
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
