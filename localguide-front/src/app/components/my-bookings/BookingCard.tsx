"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const id = Number(getId(booking));
  const status = getStatusVal(booking);

  // ไปหน้า detail เมื่อคลิกการ์ด
  function goDetail() {
    router.push(`/trip-bookings/${id}`);
  }

  // ปุ่มภายในไม่ให้เด้งไปหน้า detail
  function stopBubble(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  const isCreatingPayment = payingId === id;

  return (
    <div
      onClick={goDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goDetail();
        }
      }}
      className="block hover:no-underline bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-md transition-shadow cursor-pointer"
    >
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
        <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">ยอดรวม</div>
          <div className="font-medium">฿{getTotal(booking)}</div>
        </div>

        {/* ปุ่มรีวิว (ทริปเสร็จสิ้น + เป็นผู้ใช้ + ยังไม่รีวิว) */}
        {status === "completed" && userRole === 1 && !(booking as any).has_review && (
          <div onClick={stopBubble}>
            <button
              onClick={() => router.push(`/reviews/create/${id}`)}
              className="px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition flex items-center gap-1"
            >
              <span>⭐</span>
              เขียนรีวิว
            </button>
          </div>
        )}

        {/* ปุ่มไปหน้าทริป */}
        {(["paid", "trip_started", "trip_completed"] as const).includes(status as any) && (
          <div onClick={stopBubble}>
            <button
              onClick={() => router.push(`/trip-bookings/${id}`)}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              ไปหน้าทริป
            </button>
          </div>
        )}

        {/* ปุ่มชำระเงิน (รอชำระ + เป็นผู้ใช้) */}
        {status === "pending_payment" && userRole === 1 && (
          <div onClick={stopBubble}>
            <button
              onClick={() => onPayFromList(id)}
              disabled={isCreatingPayment}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition"
            >
              {isCreatingPayment ? "กำลังสร้างการชำระเงิน..." : "ชำระเงิน"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
