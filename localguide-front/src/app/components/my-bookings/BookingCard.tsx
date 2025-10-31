import Link from "next/link";
import type { TripBooking as TripBookingType } from "../../types";
import {
  getId,
  getTitle,
  getProvince,
  getStatusVal,
  getTotal,
  getUserName,
  getGuideName,
  getStatusColor,
  getStatusText,
} from "./bookingHelpers";

interface BookingCardProps {
  booking: TripBookingType;
  userRole?: number;
  payingId: number | null;
  onPayFromList: (id: number) => void;
}

export default function BookingCard({
  booking,
  userRole,
  payingId,
  onPayFromList,
}: BookingCardProps) {
  const id = getId(booking);
  const status = getStatusVal(booking);

  return (
    <Link href={`/trip-bookings/${id}`} className="block hover:no-underline">
      <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-md transition-shadow cursor-pointer">
        <div>
          <div className="text-lg font-semibold text-emerald-600 hover:text-emerald-700">
            {getTitle(booking)}
          </div>
          <div className="text-sm text-gray-600">{getProvince(booking)}</div>
          <div className="text-sm text-gray-700 mt-2">
            ผู้จอง: {getUserName(booking)} • ไกด์: {getGuideName(booking)}
          </div>
        </div>

      <div className="mt-4 md:mt-0 flex items-center gap-3">
        <div
          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(status)}`}
        >
          {getStatusText(status)}
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">ยอดรวม</div>
          <div className="font-medium">฿{getTotal(booking)}</div>
        </div>

        {/* Review Button for completed trips */}
        {status === "completed" &&
          userRole === 1 &&
          !(booking as any).has_review && (
            <div onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/reviews/create/${id}`}
                className="px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition flex items-center gap-1"
              >
                <span>⭐</span>
                เขียนรีวิว
              </Link>
            </div>
          )}

        {(["paid", "trip_started", "trip_completed"] as const).includes(
          status as any
        ) && (
          <div onClick={(e) => e.stopPropagation()}>
            <Link
              href={`/trip-bookings/${id}`}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              ไปหน้าทริป
            </Link>
          </div>
        )}

        {status === "pending_payment" && userRole === 1 && (
          <div onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPayFromList(Number(id));
              }}
              disabled={payingId === Number(id)}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition"
            >
              {payingId === Number(id) ? "กำลังสร้างการชำระเงิน..." : "ชำระเงิน"}
            </button>
          </div>
        )}
      </div>
    </div>
    </Link>
  );
}
