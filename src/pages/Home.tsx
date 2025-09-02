import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/store/store";
import { bootIfEmpty } from "@/store/boot";

export default function Home() {
  const { nodes, load } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await load();
        await bootIfEmpty();
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">טוען…</div>;

  const top = nodes
    .filter(n => !n.parentId || n.parentId === "home")
    .sort((a,b) => (a.order ?? 0) - (b.order ?? 0));

  if (top.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        אין נתונים להצגה כרגע.
        <div className="mt-2">
          פתחו את <Link className="text-blue-600 underline" to="/admin">האדמין</Link> ולחצו “בנה הכל”.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="header">
        <div className="header-row">
          <span className="back invisible">‹</span>
          <div></div>
          <Link className="action" to="/admin">אדמין</Link>
        </div>
        <div className="header-title">ספרים</div>
      </div>

      <div className="container">
        {top.map(card => (
          <Link
            key={card.id}
            to={"/list/" + encodeURIComponent(card.id)}
            className="block rounded-xl p-4 border bg-white mb-3"
            style={{textAlign: "right"}}
          >
            {card.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
