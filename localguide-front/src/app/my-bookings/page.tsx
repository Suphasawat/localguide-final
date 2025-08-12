"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdAttachMoney, MdCancel } from "react-icons/md";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { getUser } from "../services/auth.service";
import { tripService, TripBooking } from "../services/trip.service";

dayjs.locale("th");

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmGuideArrival = async (bookingId: number) => {
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ที่จะยืนยันว่าไกด์มาแล้ว? เงิน 50% จะถูกจ่ายให้ไกด์ทันที"
      )
    ) {
      return;
    }

    try {
      await tripService.confirmGuideArrival(bookingId);
      await loadBookings(); // รีเฟรชข้อมูล
      alert("ยืนยันไกด์มาแล้วสำเร็จ เงิน 50% ได้จ่ายให้ไกด์แล้ว");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการยืนยัน");
    }
  };

  const handleConfirmTripComplete = async (bookingId: number) => {
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ที่จะยืนยันว่าทริปเสร็จสิ้นแล้ว? เงินส่วนที่เหลือจะถูกจ่ายให้ไกด์ทันที"
      )
    ) {
      return;
    }

    try {
      await tripService.confirmTripComplete(bookingId);
      await loadBookings(); // รีเฟรชข้อมูล
      alert("ยืนยันทริปเสร็จสิ้นแล้ว เงินส่วนที่เหลือได้จ่ายให้ไกด์แล้ว");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการยืนยัน");
    }
  };

  const handleConfirmNoShow = async (bookingId: number) => {
    if (
      !confirm(
        "คุณยืนยันว่าคุณไม่ได้ไปทริปนี้จริงหรือ? เงิน 50% จะถูกจ่ายให้ไกด์ และคืนเงิน 50% ให้คุณ"
      )
    ) {
      return;
    }

    try {
      await tripService.confirmUserNoShow(bookingId);
      await loadBookings(); // รีเฟรชข้อมูล
      alert("ยืนยันว่าไม่ได้ไปแล้ว เงิน 50% จ่ายให้ไกด์ และคืนเงิน 50% ให้คุณ");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการยืนยัน");
    }
  };

  const handleDisputeNoShow = async (bookingId: number) => {
    const reason = prompt("เหตุผลที่คัดค้าน:");
    const description = prompt("รายละเอียดเพิ่มเติม:");

    if (!reason || !description) {
      alert("กรุณาใส่เหตุผลและรายละเอียด");
      return;
    }

    try {
      await tripService.disputeNoShowReport(bookingId, { reason, description });
      await loadBookings(); // รีเฟรชข้อมูล
      alert("ส่งคำคัดค้านแล้ว รอ admin ตัดสิน");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการคัดค้าน");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "trip_started":
        return "bg-purple-100 text-purple-800";
      case "trip_completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show_reported":
        return "bg-orange-100 text-orange-800";
      case "no_show_disputed":
        return "bg-indigo-100 text-indigo-800";
      case "no_show_confirmed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_payment":
        return "รอชำระเงิน";
      case "paid":
        return "ชำระเงินแล้ว";
      case "trip_started":
        return "เริ่มทริปแล้ว";
      case "trip_completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิกแล้ว";
      case "no_show_reported":
        return "ไกด์รีพอร์ตไม่มา";
      case "no_show_disputed":
        return "คัดค้านการรีพอร์ต";
      case "no_show_confirmed":
        return "ยืนยันไม่ได้ไป";
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "first_released":
        return "bg-blue-100 text-blue-800";
      case "fully_released":
        return "bg-purple-100 text-purple-800";
      case "partially_refunded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadBookings}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">การจองของฉัน</h1>
          <p className="mt-2 text-gray-600">
            ดูและจัดการการจองไกด์ท้องถิ่นของคุณ
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaCalendarAlt className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ยังไม่มีการจอง
            </h3>
            <p className="text-gray-500 mb-6">
              เมื่อคุณจองไกด์แล้ว จะแสดงรายการที่นี่
            </p>
            <button
              onClick={() => router.push("/guides")}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold"
            >
              หาไกด์ท้องถิ่น
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.ID}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-amber-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.Guide.User.FirstName}{" "}
                          {booking.Guide.User.LastName}
                        </h3>
                        <p className="text-sm text-gray-500">ไกด์ท้องถิ่น</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          booking.Status
                        )}`}
                      >
                        {getStatusText(booking.Status)}
                      </span>

                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(
                          booking.PaymentStatus
                        )}`}
                      >
                        {booking.PaymentStatus === "pending" && "รอชำระ"}
                        {booking.PaymentStatus === "paid" && "ชำระแล้ว"}
                        {booking.PaymentStatus === "first_released" &&
                          "จ่าย 50%"}
                        {booking.PaymentStatus === "fully_released" &&
                          "จ่ายครบ"}
                        {booking.PaymentStatus === "partially_refunded" &&
                          "คืนบางส่วน"}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* วันที่จอง */}
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">วันที่เที่ยว</p>
                        <p className="font-medium text-gray-900">
                          {dayjs(booking.StartDate).format("DD/MM/YYYY")}
                          <span className="text-sm text-gray-600 block">
                            จาก trip offer: {booking.TripOffer.Title}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* ราคา */}
                    <div className="flex items-center space-x-3">
                      <MdAttachMoney className="text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">ราคารวม</p>
                        <p className="font-medium text-gray-900">
                          ฿{booking.TotalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* วันที่สร้างการจอง */}
                    <div className="flex items-center space-x-3">
                      <FaClock className="text-purple-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">จองเมื่อ</p>
                        <p className="font-medium text-gray-900">
                          {dayjs(booking.CreatedAt).format("DD/MM/YYYY HH:mm")}
                        </p>
                      </div>
                    </div>

                    {/* ID การจอง */}
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">
                          #
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">หมายเลขการจอง</p>
                        <p className="font-medium text-gray-900">
                          #{booking.ID}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* หมายเหตุ */}
                  {booking.Notes && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">หมายเหตุ</p>
                      <p className="text-gray-700">{booking.Notes}</p>
                    </div>
                  )}

                  {/* Special Requests */}
                  {booking.SpecialRequests && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">
                        ความต้องการพิเศษ
                      </p>
                      <p className="text-gray-700">{booking.SpecialRequests}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 flex justify-end space-x-4">
                    {/* Payment Button */}
                    {booking.Status === "pending_payment" && (
                      <button
                        onClick={() =>
                          router.push(`/trip-bookings/${booking.ID}/payment`)
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        ชำระเงิน
                      </button>
                    )}

                    {/* Confirm Guide Arrival */}
                    {booking.Status === "paid" && (
                      <button
                        onClick={() => handleConfirmGuideArrival(booking.ID)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <FaCheckCircle className="mr-2" />
                        ยืนยันไกด์มาแล้ว
                      </button>
                    )}

                    {/* Confirm Trip Complete */}
                    {booking.Status === "trip_started" && (
                      <button
                        onClick={() => handleConfirmTripComplete(booking.ID)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                      >
                        <FaCheckCircle className="mr-2" />
                        ยืนยันทริปเสร็จ
                      </button>
                    )}

                    {/* No Show Actions */}
                    {booking.Status === "paid" && (
                      <button
                        onClick={() => handleConfirmNoShow(booking.ID)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                      >
                        <FaTimesCircle className="mr-2" />
                        ฉันไม่ได้ไป
                      </button>
                    )}

                    {/* Dispute No Show Report */}
                    {booking.Status === "no_show_reported" && (
                      <button
                        onClick={() => handleDisputeNoShow(booking.ID)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
                      >
                        <FaExclamationTriangle className="mr-2" />
                        คัดค้านการรีพอร์ต
                      </button>
                    )}

                    <button
                      onClick={() =>
                        router.push(`/trip-bookings/${booking.ID}`)
                      }
                      className="px-4 py-2 text-amber-600 border border-amber-600 rounded-lg hover:bg-amber-50"
                    >
                      ดูรายละเอียด
                    </button>

                    {booking.Status === "trip_completed" && (
                      <button
                        onClick={() =>
                          router.push(`/guides/${booking.GuideID}?review=true`)
                        }
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                      >
                        เขียนรีวิว
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
