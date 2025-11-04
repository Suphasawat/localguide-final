import Link from "next/link";
import BookingCard from "./BookingCard";

interface RecentBookingsProps {
  bookings: any[];
  isGuide: boolean;
}

export default function RecentBookings({
  bookings,
  isGuide,
}: RecentBookingsProps) {
  const hasBookings = bookings.length > 0;
  const displayBookings = bookings.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">การจองล่าสุด</h2>
        <Link
          href="/trip-bookings"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition"
        >
          ดูทั้งหมด →
        </Link>
      </div>

      {hasBookings ? (
        <div className="space-y-3">
          {displayBookings.map((booking) => (
            <BookingCard
              key={booking.id || booking.ID}
              booking={booking}
              isGuide={isGuide}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-3">🧳</div>
          <p className="text-gray-600 mb-4">ยังไม่มีการจอง</p>
          <Link
            href="/guide/browse-trips"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold shadow-sm transition"
          >
            เริ่มต้นหาทริป
          </Link>
        </div>
      )}
    </div>
  );
}
