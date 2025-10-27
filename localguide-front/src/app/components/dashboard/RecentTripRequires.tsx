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
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">ความต้องการเที่ยวล่าสุด</h2>
        <Link
          href="/user/trip-requires"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          ดูทั้งหมด
        </Link>
      </div>

      {hasRequires ? (
        <div className="space-y-4">
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
        <div className="text-center py-10">
          <div className="text-5xl mb-2">🗺️</div>
          <p className="text-gray-500">ยังไม่มีความต้องการเที่ยว</p>
          <Link
            href="/user/trip-requires/create"
            className="inline-block mt-3 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            สร้างความต้องการแรก
          </Link>
        </div>
      )}
    </div>
  );
}
