"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripBookingAPI } from "../lib/api";
import Link from "next/link";

interface TripBooking {
  ID: number;
  StartDate: string;
  TotalAmount: number;
  Status: string;
  PaymentStatus: string;
  TripStartedAt?: string;
  TripCompletedAt?: string;
  User: {
    ID: number;
    FirstName: string;
    LastName: string;
  };
  Guide: {
    ID: number;
    User: {
      FirstName: string;
      LastName: string;
    };
  };
  TripOffer: {
    Title: string;
    TripRequire: {
      Title: string;
      Province: {
        Name: string;
      };
    };
  };
}

export default function TripBookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    loadBookings();
  }, [user, isAuthenticated, router]);

  const loadBookings = async () => {
    try {
      const response = await tripBookingAPI.getAll();
      setBookings(response.data?.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmGuideArrival = async (bookingId: number) => {
    try {
      await tripBookingAPI.confirmGuideArrival(bookingId);
      loadBookings(); // Reload data
    } catch (error) {
      console.error("Failed to confirm guide arrival:", error);
      alert("ไม่สามารถยืนยันได้");
    }
  };

  const handleConfirmTripComplete = async (bookingId: number) => {
    try {
      await tripBookingAPI.confirmTripComplete(bookingId);
      loadBookings(); // Reload data
    } catch (error) {
      console.error("Failed to confirm trip complete:", error);
      alert("ไม่สามารถยืนยันได้");
    }
  };

  const handleReportNoShow = async (bookingId: number) => {
    const reason = prompt("กรุณาระบุเหตุผลที่ลูกค้าไม่มา:");
    if (!reason) return;

    try {
      await tripBookingAPI.reportUserNoShow(bookingId, { reason });
      loadBookings(); // Reload data
    } catch (error) {
      console.error("Failed to report no show:", error);
      alert("ไม่สามารถรีพอร์ตได้");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "trip_started":
        return "bg-green-100 text-green-800";
      case "trip_completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "รอชำระเงิน";
      case "paid":
        return "ชำระแล้ว";
      case "trip_started":
        return "เริ่มทริปแล้ว";
      case "trip_completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      case "no_show":
        return "ลูกค้าไม่มา";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">การจองทริป</h1>
          <p className="mt-2 text-gray-600">ดูและจัดการการจองทริปของคุณ</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">ไม่มีการจองทริปในขณะนี้</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.ID}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.TripOffer?.Title}
                      </h3>
                      <p className="text-gray-600">
                        {booking.TripOffer?.TripRequire?.Title}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                        booking.Status
                      )}`}
                    >
                      {getStatusText(booking.Status)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-sm">
                      <div>
                        📍 จังหวัด:{" "}
                        {booking.TripOffer?.TripRequire?.Province?.Name}
                      </div>
                      <div>
                        👤 ลูกค้า: {booking.User?.FirstName}{" "}
                        {booking.User?.LastName}
                      </div>
                      <div>
                        🏃‍♂️ ไกด์: {booking.Guide?.User?.FirstName}{" "}
                        {booking.Guide?.User?.LastName}
                      </div>
                      <div>
                        📅 วันเริ่มทริป:{" "}
                        {new Date(booking.StartDate).toLocaleDateString(
                          "th-TH"
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        💰 ราคารวม: {booking.TotalAmount?.toLocaleString()} บาท
                      </div>
                      <div>💳 สถานะชำระเงิน: {booking.PaymentStatus}</div>
                      {booking.TripStartedAt && (
                        <div>
                          🚀 เริ่มทริป:{" "}
                          {new Date(booking.TripStartedAt).toLocaleDateString(
                            "th-TH"
                          )}
                        </div>
                      )}
                      {booking.TripCompletedAt && (
                        <div>
                          ✅ เสร็จสิ้น:{" "}
                          {new Date(booking.TripCompletedAt).toLocaleDateString(
                            "th-TH"
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions based on user role and booking status */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/trip-bookings/${booking.ID}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      ดูรายละเอียด
                    </Link>

                    {/* User actions */}
                    {user?.role === 1 && (
                      <>
                        {booking.Status === "pending_payment" && (
                          <Link
                            href={`/trip-bookings/${booking.ID}/payment`}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                          >
                            ชำระเงิน
                          </Link>
                        )}

                        {booking.Status === "paid" && (
                          <button
                            onClick={() =>
                              handleConfirmGuideArrival(booking.ID)
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                          >
                            ยืนยันไกด์มาแล้ว
                          </button>
                        )}

                        {booking.Status === "trip_started" && (
                          <button
                            onClick={() =>
                              handleConfirmTripComplete(booking.ID)
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                          >
                            ยืนยันทริปเสร็จ
                          </button>
                        )}
                      </>
                    )}

                    {/* Guide actions */}
                    {user?.role === 2 && booking.Status === "paid" && (
                      <button
                        onClick={() => handleReportNoShow(booking.ID)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        รีพอร์ตลูกค้าไม่มา
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
