"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "../components/Loading";
import { tripRequireAPI, tripBookingAPI } from "../lib/api";
import { TripRequire, TripBooking } from "../types";

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tripRequires, setTripRequires] = useState<TripRequire[]>([]);
  const [bookings, setBookings] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, isAuthenticated, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load trip requires for users
      if (user?.role?.name !== "guide") {
        const tripRequiresResponse = await tripRequireAPI.getOwn();
        setTripRequires(tripRequiresResponse.data?.trip_requires || []);
      }

      // Load bookings for everyone
      const bookingsResponse = await tripBookingAPI.getAll();
      setBookings(bookingsResponse.data?.bookings || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <Loading text="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          สวัสดี, {user.first_name} {user.last_name}
        </h1>
        <p className="text-gray-600 mt-2">
          {user.role?.name === "guide"
            ? "แดชบอร์ดสำหรับไกด์"
            : "แดชบอร์ดสำหรับนักท่องเที่ยว"}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {user.role?.name === "guide" ? (
          <>
            <Link
              href="/guide/trip-requires"
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center"
            >
              <h3 className="text-lg font-semibold mb-2">
                ดูความต้องการเที่ยว
              </h3>
              <p className="text-sm opacity-90">หาโอกาสงานใหม่</p>
            </Link>
            <Link
              href="/guide/offers"
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center"
            >
              <h3 className="text-lg font-semibold mb-2">ข้อเสนอของฉัน</h3>
              <p className="text-sm opacity-90">จัดการข้อเสนอ</p>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/user/trip-requires/create"
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center"
            >
              <h3 className="text-lg font-semibold mb-2">โพสต์ความต้องการ</h3>
              <p className="text-sm opacity-90">หาไกด์ใหม่</p>
            </Link>
            <Link
              href="/user/trip-requires"
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center"
            >
              <h3 className="text-lg font-semibold mb-2">ความต้องการของฉัน</h3>
              <p className="text-sm opacity-90">จัดการโพสต์</p>
            </Link>
          </>
        )}

        <Link
          href="/bookings"
          className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center"
        >
          <h3 className="text-lg font-semibold mb-2">การจองของฉัน</h3>
          <p className="text-sm opacity-90">ดูสถานะการจอง</p>
        </Link>

        <Link
          href="/profile"
          className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg text-center"
        >
          <h3 className="text-lg font-semibold mb-2">โปรไฟล์</h3>
          <p className="text-sm opacity-90">แก้ไขข้อมูล</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Trip Requires (for regular users) */}
        {user.role?.name !== "guide" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">ความต้องการเที่ยวล่าสุด</h2>
              <Link
                href="/user/trip-requires"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ดูทั้งหมด
              </Link>
            </div>

            {tripRequires.length > 0 ? (
              <div className="space-y-4">
                {tripRequires.slice(0, 3).map((tripRequire) => (
                  <div
                    key={tripRequire.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {tripRequire.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {tripRequire.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          tripRequire.status === "open"
                            ? "bg-green-100 text-green-800"
                            : tripRequire.status === "in_review"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {tripRequire.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {tripRequire.offers_count || 0} ข้อเสนอ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                ยังไม่มีความต้องการเที่ยว
                <br />
                <Link
                  href="/user/trip-requires/create"
                  className="text-blue-600 hover:text-blue-800"
                >
                  สร้างความต้องการแรก
                </Link>
              </p>
            )}
          </div>
        )}

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">การจองล่าสุด</h2>
            <Link
              href="/bookings"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ดูทั้งหมด
            </Link>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-gray-900">
                    {booking.trip_title || `Booking #${booking.id}`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {user.role?.name === "guide"
                      ? booking.user_name
                      : booking.guide_name}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending_payment"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "trip_completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      ฿{booking.total_amount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">ยังไม่มีการจอง</p>
          )}
        </div>
      </div>
    </div>
  );
}
