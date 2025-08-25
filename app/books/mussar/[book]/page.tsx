// app/books/mussar/[book]/page.tsx
"use client";

import Link from "next/link";
import { getMussarBook } from "@/lib/mussarIndex";

type Props = { params: { book: string } };

export default function MussarBookPage({ params }: Props) {
  const book = getMussarBook(params.book);
  if (!book) {
    return <div className="text-center text-red-600">הספר לא נמצא</div>;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-800 text-center">{book.name}</h1>
      <div className="mb-6 text-center text-sm text-gray-600">
        סה״כ פרקים: {book.chapters.length}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {book.chapters.map(({ num, title }) => (
          <Link
            key={num}
            href={{ pathname: "/study/mussar/[book]/[perek]", query: { book: book.id, perek: num } }}
            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-5 text-center text-base text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="font-medium">
              פרק {toHeb(num)}{title ? ` – ${title}` : ""}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function toHeb(n: number) {
  const letters = "אבגדהוזחטיכלמנסעפצקרשת";
  if (n <= 0) return String(n);
  if (n <= 22) return letters[n - 1];
  return String(n);
}
