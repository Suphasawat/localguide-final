"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tripBookingAPI } from "../lib/api";
import { TripBooking } from "../types";
import Loading from "@/app/components/Loading";

export default function BookingsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    status: "",
    paymentStatus: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      loadBookings();
    }
  }, [user, authLoading, isAuthenticated, router]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await tripBookingAPI.getAll();
      setBookings(response.data?.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setError("ไม่สามารถโหลดข้อมูลการจองได้");
    } finally {
      setLoading(false);
    }
  };

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

  const handleConfirmAction = async (bookingId: number, action: string) => {
    try {
      switch (action) {
        case "confirm_guide_arrival":
          await tripBookingAPI.confirmGuideArrival(bookingId);
          break;
        case "confirm_trip_complete":
          await tripBookingAPI.confirmTripComplete(bookingId);
          break;
        case "report_no_show":
          await tripBookingAPI.reportUserNoShow(bookingId, {
            reason: "User did not show up as scheduled",
          });
          break;
      }
      loadBookings(); // Reload data
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      alert("ไม่สามารถดำเนินการได้");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter.status && booking.Status !== filter.status) return false;
    if (filter.paymentStatus && booking.PaymentStatus !== filter.paymentStatus)
      return false;
    return true;
  });

  if (authLoading || loading) {
    return <Loading text="กำลังโหลดข้อมูลการจอง..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">การจองทั้งหมด</h1>
          <p className="mt-2 text-gray-600">ดูและจัดการการจองทริปของคุณ</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ตัวกรอง</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานะการจอง
              </label>
              <select
                value={filter.status}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="pending_payment">รอชำระเงิน</option>
                <option value="paid">ชำระแล้ว</option>
                <option value="trip_started">เริ่มทริปแล้ว</option>
                <option value="trip_completed">เสร็จสิ้น</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานะการชำระเงิน
              </label>
              <select
                value={filter.paymentStatus}
                onChange={(e) =>
                  setFilter({ ...filter, paymentStatus: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="pending">รอชำระ</option>
                <option value="paid">ชำระแล้ว</option>
                <option value="first_released">จ่ายครั้งแรกแล้ว</option>
                <option value="fully_released">จ่ายครบแล้ว</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({ status: "", paymentStatus: "" })}
                className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ไม่มีการจอง
            </h3>
            <p className="text-gray-500 mb-4">
              {bookings.length === 0
                ? "คุณยังไม่มีการจองทริปใดๆ"
                : "ไม่มีการจองที่ตรงกับตัวกรองที่เลือก"}
            </p>
            {user?.role === 1 && (
              <Link
                href="/user/trip-requires/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                สร้างความต้องการเที่ยวใหม่
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking.ID}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {booking.TripOffer?.Title || "การจองทริป"}
                      </h3>
                      <div className="flex space-x-2">
                        {getStatusBadge(booking.Status)}
                        {getPaymentStatusBadge(booking.PaymentStatus)}
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
                      {booking.Guide?.User?.FirstName}{" "}
                      {booking.Guide?.User?.LastName}
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
                    <h4 className="font-medium text-blue-800 mb-1">
                      ความต้องการพิเศษ:
                    </h4>
                    <p className="text-blue-700 text-sm">
                      {booking.SpecialRequests}
                    </p>
                  </div>
                )}

                {booking.Notes && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <h4 className="font-medium text-gray-800 mb-1">
                      หมายเหตุ:
                    </h4>
                    <p className="text-gray-700 text-sm">{booking.Notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    จองเมื่อ: {formatDate(booking.CreatedAt)}
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      href={`/trip-bookings/${booking.ID}`}
                      className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      ดูรายละเอียด
                    </Link>

                    {/* Actions based on status and user role */}
                    {booking.Status === "paid" && user?.role === 1 && (
                      <button
                        onClick={() =>
                          handleConfirmAction(
                            booking.ID,
                            "confirm_guide_arrival"
                          )
                        }
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        ยืนยันไกด์มาแล้ว
                      </button>
                    )}

                    {booking.Status === "trip_started" && user?.role === 1 && (
                      <button
                        onClick={() =>
                          handleConfirmAction(
                            booking.ID,
                            "confirm_trip_complete"
                          )
                        }
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        ยืนยันทริปเสร็จ
                      </button>
                    )}

                    {booking.Status === "paid" && user?.role === 2 && (
                      <button
                        onClick={() =>
                          handleConfirmAction(booking.ID, "report_no_show")
                        }
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
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {bookings.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              สรุปข้อมูล
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    bookings.filter((b) => b.Status === "pending_payment")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">รอชำระเงิน</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {
                    bookings.filter(
                      (b) => b.Status === "paid" || b.Status === "trip_started"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">กำลังดำเนินการ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter((b) => b.Status === "trip_completed").length}
                </div>
                <div className="text-sm text-gray-600">เสร็จสิ้น</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {bookings.length}
                </div>
                <div className="text-sm text-gray-600">ทั้งหมด</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
