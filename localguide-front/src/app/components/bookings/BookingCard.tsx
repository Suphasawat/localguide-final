import Link from "next/link";
import { TripBooking } from "@/app/types";

interface BookingCardProps {
  booking: TripBooking;
  userRole?: number;
  onConfirmAction: (bookingId: number, action: string) => void;
}

export default function BookingCard({
  booking,
  userRole,
  onConfirmAction,
}: BookingCardProps) {
  const getStatusBadge = (status: string) => {
    const colors = {
      pending_payment: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      trip_started: "bg-green-100 text-green-800",
      trip_completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-orange-100 text-orange-800",
    };
    const labels = {
      pending_payment: "รอชำระเงิน",
      paid: "ชำระแล้ว",
      trip_started: "เริ่มทริปแล้ว",
      trip_completed: "เสร็จสิ้น",
      cancelled: "ยกเลิก",
      no_show: "ไม่มาตามนัด",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      first_released: "bg-blue-100 text-blue-800",
      fully_released: "bg-gray-100 text-gray-800",
      partially_refunded: "bg-orange-100 text-orange-800",
      refunded: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "รอชำระ",
      paid: "ชำระแล้ว",
      first_released: "จ่ายครั้งแรกแล้ว",
      fully_released: "จ่ายครบแล้ว",
      partially_refunded: "คืนเงินบางส่วน",
      refunded: "คืนเงินแล้ว",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {booking.TripOffer?.Title || "การจองทริป"}
            </h3>
            <div className="flex space-x-2">
              {booking.Status && getStatusBadge(booking.Status)}
              {booking.PaymentStatus &&
                getPaymentStatusBadge(booking.PaymentStatus)}
            </div>
          </div>
          <p className="text-gray-600 mb-2">
            📍 {booking.TripOffer?.TripRequire?.Province?.Name}
          </p>
          {booking.TripOffer?.Description && (
            <p className="text-gray-700 mb-2">
              {booking.TripOffer.Description}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
        <div className="space-y-2">
          <div>
            <span className="font-medium">💰 ราคารวม:</span>{" "}
            {booking.TotalAmount?.toLocaleString()} บาท
          </div>
          <div>
            <span className="font-medium">👤 ไกด์:</span>{" "}
            {booking.Guide?.User?.FirstName} {booking.Guide?.User?.LastName}
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-medium">📅 วันเริ่มทริป:</span>{" "}
            {formatDate(booking.StartDate)}
          </div>
          {booking.TripStartedAt && (
            <div>
              <span className="font-medium">🚀 เริ่มทริป:</span>{" "}
              {formatDate(booking.TripStartedAt)}
            </div>
          )}
        </div>
        <div className="space-y-2">
          {booking.TripCompletedAt && (
            <div>
              <span className="font-medium">✅ เสร็จสิ้น:</span>{" "}
              {formatDate(booking.TripCompletedAt)}
            </div>
          )}
          {booking.CancelledAt && (
            <div>
              <span className="font-medium">❌ ยกเลิก:</span>{" "}
              {formatDate(booking.CancelledAt)}
            </div>
          )}
        </div>
      </div>

      {booking.SpecialRequests && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-800 mb-1">ความต้องการพิเศษ:</h4>
          <p className="text-blue-700 text-sm">{booking.SpecialRequests}</p>
        </div>
      )}

      {booking.Notes && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="font-medium text-gray-800 mb-1">หมายเหตุ:</h4>
          <p className="text-gray-700 text-sm">{booking.Notes}</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          จองเมื่อ: {booking.CreatedAt && formatDate(booking.CreatedAt)}
        </div>

        <div className="flex space-x-3">
          <Link
            href={`/trip-bookings/${booking.ID}`}
            className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            ดูรายละเอียด
          </Link>

          {/* Actions based on status and user role */}
          {booking.Status === "paid" && userRole === 1 && (
            <button
              onClick={() =>
                onConfirmAction(booking.ID, "confirm_guide_arrival")
              }
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              ยืนยันไกด์มาแล้ว
            </button>
          )}

          {booking.Status === "trip_started" && userRole === 1 && (
            <button
              onClick={() =>
                onConfirmAction(booking.ID, "confirm_trip_complete")
              }
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ยืนยันทริปเสร็จ
            </button>
          )}

          {booking.Status === "paid" && userRole === 2 && (
            <button
              onClick={() => onConfirmAction(booking.ID, "report_no_show")}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              รายงานไม่มา
            </button>
          )}

          {booking.Status === "pending_payment" && (
            <Link
              href={`/trip-bookings/${booking.ID}/payment`}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              ชำระเงิน
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
