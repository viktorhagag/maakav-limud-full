import { Link } from "react-router-dom";

export default function AdminButton() {
  return (
    <Link
      to="/admin"
      className="fixed bottom-5 left-5 bg-blue-600 text-white rounded-full px-4 py-2 shadow-lg text-sm"
    >
      אדמין
    </Link>
  );
}
