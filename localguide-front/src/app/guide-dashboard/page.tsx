"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUser } from "../services/auth.service";
import { tripService } from "../services/trip.service";
import { useRouter } from "next/navigation";

export default function GuideDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeBookings: 0,
    completedTrips: 0,
    totalEarnings: 0,
  });
  const [recentRequires, setRecentRequires] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const user = getUser();
  const router = useRouter();

  useEffect(() => {
    // ตรวจสอบว่าเป็น guide หรือไม่
    if (!user || user.role !== 2) {
      router.push("/");
      return;
    }

    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // โหลดข้อมูลต่างๆ
      const [requires, bookings] = await Promise.all([
        tripService.getTripRequires(),
        tripService.getTripBookings(),
      ]);

      setRecentRequires(requires.slice(0, 5)); // แสดง 5 รายการล่าสุด
      setMyBookings(bookings.slice(0, 5));

      // คำนวณสถิติ
      setStats({
        totalOffers: 0, // จะต้องเพิ่ม API สำหรับ guide offers
        activeBookings: bookings.filter(
          (b: any) => b.status === "confirmed" || b.status === "ongoing"
        ).length,
        completedTrips: bookings.filter((b: any) => b.status === "completed")
          .length,
        totalEarnings: bookings
          .filter((b: any) => b.status === "completed")
          .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0),
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ดไกด์</h1>
          <p className="mt-2 text-gray-600">จัดการข้อมูลและการจองของคุณ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  ข้อเสนอทั้งหมด
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOffers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  การจองที่กำลังดำเนินการ
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v4l3-3-3-3m6-6h2a2 2 0 012 2v6a2 2 0 01-2 2h-2"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  ทริปที่เสร็จสิ้น
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedTrips}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-amber-100 rounded-md flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">รายได้รวม</h3>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{stats.totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ความต้องการใหม่
            </h3>
            <p className="text-gray-600 mb-4">
              ดูความต้องการไกด์ล่าสุดและส่งข้อเสนอ
            </p>
            <Link
              href="/trip-requires"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              ดูความต้องการทั้งหมด
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              จัดการการจอง
            </h3>
            <p className="text-gray-600 mb-4">
              ตรวจสอบสถานะการจองและแจ้งการมาทำงาน
            </p>
            <Link
              href="/my-bookings"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              ดูการจองของฉัน
            </Link>
          </div>
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Trip Requirements */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                ความต้องการล่าสุด
              </h2>
            </div>
            <div className="p-6">
              {recentRequires.length > 0 ? (
                <div className="space-y-4">
                  {recentRequires.map((require) => (
                    <div
                      key={require.ID}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-gray-900">
                        {require.Title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {require.Province?.Name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        ฿{require.MinPrice?.toLocaleString()} - ฿
                        {require.MaxPrice?.toLocaleString()}
                      </p>
                      <div className="mt-2">
                        <Link
                          href={`/trip-requires/${require.ID}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ดูรายละเอียด →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">
                  ยังไม่มีความต้องการใหม่
                </p>
              )}
            </div>
          </div>

          {/* My Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                การจองล่าสุด
              </h2>
            </div>
            <div className="p-6">
              {myBookings.length > 0 ? (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
                    <div
                      key={booking.ID}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-gray-900">
                        {booking.TripRequire?.Title || "ไม่ระบุชื่อ"}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        สถานะ: {booking.status}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        ฿{booking.total_price?.toLocaleString()}
                      </p>
                      <div className="mt-2">
                        <Link
                          href={`/trip-bookings/${booking.ID}`}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          จัดการ →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">ยังไม่มีการจอง</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
