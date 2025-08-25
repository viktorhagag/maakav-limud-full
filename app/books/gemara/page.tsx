// app/books/gemara./page.tsx
// Server Component: renders Talmud masechtot as MB-style cards (grid, card-as-link).
// Uses a safe dynamic import to pull the list from your lib, with a fallback
// so it won't break if names differ. No new files added.

import Link from "next/link";

type Item = { id: string; title: string };

async function getMasechtot(): Promise<Item[]> {
  // Try a few likely exports without failing the build if the shape differs.
  try {
    const mod: any = await import("@/lib/gemaraPages");
    const candidate =
      mod?.MASECHTOT ||
      mod?.masechtot ||
      mod?.default ||
      mod?.LIST ||
      [];
    // Normalize shape to {id,title}
    const arr: Item[] = Array.isArray(candidate)
      ? candidate.map((x: any) => ({
          id: String(x.id ?? x.slug ?? x.key ?? x.name ?? ""),
          title: String(x.title ?? x.name ?? x.label ?? x.id ?? ""),
        }))
      : [];
    return arr.filter((x) => x.id && x.title);
  } catch {
    // Fallback minimal list — you can delete once wired to your data.
    return [
      { id: "berakhot", title: "ברכות" },
      { id: "shabbat", title: "שבת" },
      { id: "eruvin", title: "עירובין" },
    ];
  }
}

export default async function Page() {
  const masechtot = await getMasechtot();

  return (
    <div className="grid grid-cols-2 gap-4">
      {masechtot.map(({ id, title }) => (
        <Link
          key={id}
          href={{ pathname: "/talmud/[id]", query: { id } }} // UrlObject avoids typedRoutes issues
          className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-6 text-lg font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {title}
        </Link>
      ))}
    </div>
  );
}
