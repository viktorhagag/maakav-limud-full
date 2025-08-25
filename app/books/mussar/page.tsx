// app/books/mussar/page.tsx
"use client";

import Link from "next/link";
import { MUSSAR_BOOKS } from "@/lib/mussarIndex";

export default function MussarIndexPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {MUSSAR_BOOKS.map(({ id, name, chapters }) => (
        <Link
          key={id}
          href={{ pathname: "/books/mussar/[book]", query: { book: id } }}
          className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-6 text-center text-lg font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div>{name}</div>
          <div className="mt-2 text-sm text-gray-500">סה״כ פרקים: {chapters.length}</div>
        </Link>
      ))}
    </div>
  );
}
