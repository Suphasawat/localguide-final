import Link from "next/link";
import TripRequireCard from "./TripRequireCard";

interface RecentTripRequiresProps {
  tripRequires: any[];
  getProvince: (r: any) => string;
  getDateRange: (r: any) => string;
}

export default function RecentTripRequires({
  tripRequires,
  getProvince,
  getDateRange,
}: RecentTripRequiresProps) {
  const hasRequires = tripRequires.length > 0;
  const displayRequires = tripRequires.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          ความต้องการเที่ยวล่าสุด
        </h2>
        <Link
          href="/user/trip-requires"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition"
        >
          ดูทั้งหมด →
        </Link>
      </div>

      {hasRequires ? (
        <div className="space-y-3">
          {displayRequires.map((require) => (
            <TripRequireCard
              key={require.ID}
              require={require}
              getProvince={getProvince}
              getDateRange={getDateRange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-3">🗺️</div>
          <p className="text-gray-600 mb-4">ยังไม่มีความต้องการเที่ยว</p>
          <Link
            href="/user/trip-requires/create"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold shadow-sm transition"
          >
            สร้างความต้องการแรก
          </Link>
        </div>
      )}
    </div>
  );
}
