import Link from "next/link";

interface TripRequireCardProps {
  require: any;
  getProvince: (r: any) => string;
  getDateRange: (r: any) => string;
}

export default function TripRequireCard({
  require,
  getProvince,
  getDateRange,
}: TripRequireCardProps) {
  const statusColors: Record<string, string> = {
    open: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    in_review: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    assigned: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    completed: "bg-gray-50 text-gray-700 ring-1 ring-gray-200",
    cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
  };

  const status = require.Status || "unknown";
  const statusClass =
    statusColors[status] || "bg-gray-50 text-gray-700 ring-1 ring-gray-200";

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
          {require.Title || "ไม่ระบุหัวข้อ"}
        </h3>
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}
        >
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-600">
        📍 {getProvince(require)} • 📅 {getDateRange(require)}
      </p>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          💼{" "}
          {typeof require.total_offers === "number" ? require.total_offers : 0}{" "}
          ข้อเสนอ
        </span>
        <Link
          href={`/user/trip-requires/${require.ID}`}
          className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition"
        >
          ดูรายละเอียด →
        </Link>
      </div>
    </div>
  );
}
