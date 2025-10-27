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
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">การจองล่าสุด</h2>
        <Link
          href="/trip-bookings"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          ดูทั้งหมด
        </Link>
      </div>

      {hasBookings ? (
        <div className="space-y-4">
          {displayBookings.map((booking) => (
            <BookingCard
              key={booking.id || booking.ID}
              booking={booking}
              isGuide={isGuide}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="text-5xl mb-2">🧳</div>
          <p className="text-gray-500">ยังไม่มีการจอง</p>
          <Link
            href="/guide/browse-trips"
            className="inline-block mt-3 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
          >
            เริ่มต้นหาทริป
          </Link>
        </div>
      )}
    </div>
  );
}
