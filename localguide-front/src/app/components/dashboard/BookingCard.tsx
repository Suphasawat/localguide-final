import Link from "next/link";

interface BookingCardProps {
  booking: any;
  isGuide: boolean;
}

export default function BookingCard({ booking, isGuide }: BookingCardProps) {
  const statusColors: Record<string, string> = {
    pending_payment: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    paid: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    trip_started: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    trip_completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
    no_show: "bg-red-50 text-red-700 ring-1 ring-red-200",
  };

  const status = booking.status || booking.Status || "unknown";
  const statusClass =
    statusColors[status] || "bg-gray-50 text-gray-700 ring-1 ring-gray-200";

  const title =
    booking.trip_title && booking.trip_title.length > 0
      ? booking.trip_title
      : booking.province_name && booking.start_date
      ? booking.province_name + " • " + booking.start_date
      : "การจอง #" + String(booking.id || booking.ID);

  const partner =
    isGuide && booking.user_name
      ? booking.user_name
      : !isGuide && booking.guide_name
      ? booking.guide_name
      : null;

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
          {title}
        </h3>
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}
        >
          {status}
        </span>
      </div>
      {partner && (
        <p className="text-sm text-gray-600">
          👤 {isGuide ? "ลูกค้า" : "ไกด์"}: {partner}
        </p>
      )}
      <div className="mt-3 pt-3 border-t border-gray-100 text-right">
        <Link
          href={`/trip-bookings/${String(booking.id || booking.ID)}`}
          className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition"
        >
          ดูรายละเอียด →
        </Link>
      </div>
    </div>
  );
}
