import Link from "next/link";

interface BookingCardProps {
  booking: any;
  isGuide: boolean;
}

export default function BookingCard({ booking, isGuide }: BookingCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 line-clamp-1">
        {booking.trip_title && booking.trip_title.length > 0
          ? booking.trip_title
          : booking.province_name && booking.start_date
          ? booking.province_name + " • " + booking.start_date
          : "การจอง #" + String(booking.id || booking.ID)}
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        สถานะ:{" "}
        {booking.status && booking.status.length > 0
          ? booking.status
          : "unknown"}
        {isGuide && booking.user_name
          ? " • คู่สนทนา: " + booking.user_name
          : ""}
        {!isGuide && booking.guide_name
          ? " • คู่สนทนา: " + booking.guide_name
          : ""}
      </p>
      <div className="mt-2 text-right">
        <Link
          href={`/trip-bookings/${String(booking.id || booking.ID)}`}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ดูรายละเอียด
        </Link>
      </div>
    </div>
  );
}
