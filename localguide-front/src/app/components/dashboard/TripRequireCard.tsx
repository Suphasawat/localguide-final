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
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 line-clamp-1">
        {require.Title || "ไม่ระบุหัวข้อ"}
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        {getProvince(require)} • {getDateRange(require)}
      </p>
      <div className="flex justify-between items-center mt-2">
        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
          {require.Status ? require.Status : "unknown"}
        </span>
        <span className="text-sm text-gray-500">
          {typeof require.total_offers === "number" ? require.total_offers : 0}{" "}
          ข้อเสนอ
        </span>
      </div>
      <div className="mt-2 text-right">
        <Link
          href={`/user/trip-requires/${require.ID}`}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ดูรายละเอียด
        </Link>
      </div>
    </div>
  );
}
