"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaClock } from "react-icons/fa";
import { MdAttachMoney, MdCancel } from "react-icons/md";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { getUser } from "../services/auth.service";
import { bookingService, Booking } from "../services/booking.service";

dayjs.locale("th");

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
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
      const data = await bookingService.getUserBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings(); // รีเฟรชข้อมูล
      alert("ยกเลิกการจองสำเร็จ");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการยกเลิกการจอง");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "รอการยืนยัน";
      case "confirmed":
        return "ยืนยันแล้ว";
      case "completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิกแล้ว";
      default:
        return status;
    }
  };

  const canCancelBooking = (booking: Booking) => {
    const bookingDate = booking.StartDate || booking.BookingDate;
    return (
      booking.Status.toLowerCase() === "pending" &&
      bookingDate &&
      dayjs(bookingDate).isAfter(dayjs(), "day")
    );
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
                        {booking.Guide.User.Nickname && (
                          <p className="text-sm text-gray-500">
                            ({booking.Guide.User.Nickname})
                          </p>
                        )}
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

                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking.ID)}
                          disabled={cancellingId === booking.ID}
                          className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <MdCancel className="mr-1" />
                          {cancellingId === booking.ID
                            ? "กำลังยกเลิก..."
                            : "ยกเลิก"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* วันที่จอง */}
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">ช่วงวันที่</p>
                        <p className="font-medium text-gray-900">
                          {booking.EndDate &&
                          booking.StartDate &&
                          booking.StartDate !== booking.EndDate ? (
                            <>
                              {dayjs(booking.StartDate).format("DD/MM/YYYY")} -{" "}
                              {dayjs(booking.EndDate).format("DD/MM/YYYY")}
                              <span className="text-sm text-gray-600 block">
                                (
                                {booking.Days ||
                                  Math.max(
                                    1,
                                    Math.ceil(
                                      (new Date(booking.EndDate).getTime() -
                                        new Date(booking.StartDate).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    ) + 1
                                  )}{" "}
                                วัน)
                              </span>
                            </>
                          ) : (
                            <>
                              {dayjs(
                                booking.StartDate || booking.BookingDate
                              ).format("dddd, DD MMMM YYYY")}
                              <span className="text-sm text-gray-600 block">
                                (1 วัน)
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* ราคา */}
                    <div className="flex items-center space-x-3">
                      <MdAttachMoney className="text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">ราคารวม</p>
                        <p className="font-medium text-gray-900">
                          {(() => {
                            const days =
                              booking.Days ||
                              (booking.EndDate && booking.StartDate
                                ? Math.max(
                                    1,
                                    Math.ceil(
                                      (new Date(booking.EndDate).getTime() -
                                        new Date(booking.StartDate).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    ) + 1
                                  )
                                : 1);
                            const totalPrice =
                              booking.TotalPrice || days * booking.Guide.Price;
                            return (
                              <>
                                ฿{totalPrice.toLocaleString()}
                                {days > 1 && (
                                  <span className="text-sm text-gray-600 block">
                                    (฿{booking.Guide.Price.toLocaleString()}/วัน
                                    × {days} วัน)
                                  </span>
                                )}
                              </>
                            );
                          })()}
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
                  {booking.Note && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">หมายเหตุ</p>
                      <p className="text-gray-700">{booking.Note}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => router.push(`/guides/${booking.GuideID}`)}
                      className="px-4 py-2 text-amber-600 border border-amber-600 rounded-lg hover:bg-amber-50"
                    >
                      ดูรายละเอียดไกด์
                    </button>

                    {booking.Status.toLowerCase() === "completed" && (
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
