import { Link } from "react-router-dom";

export default function AdminExitButton() {
  return (
    <Link
      to="/"
      title="חזרה לעמוד הבית"
      style={{
        position: "fixed",
        top: "12px",
        left: "12px",
        zIndex: 50,
        background: "rgba(0,0,0,0.65)",
        color: "white",
        borderRadius: "9999px",
        padding: "8px 12px",
        fontSize: "14px",
        textDecoration: "none",
      }}
    >
      ← חזרה
    </Link>
  );
}
