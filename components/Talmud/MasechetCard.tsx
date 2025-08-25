// components/Talmud/MasechetCard.tsx
"use client";

import Link from "next/link";

type Props = {
  id: string;
  title: string;
  last?: string;
};

export default function MasechetCard({ id, title }: Props) {
  return (
    <Link
      href={`/talmud/${id}`}
      className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-6 text-lg font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {title}
    </Link>
  );
}
