"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";

// นำ API มาใช้
import { tripRequireAPI, tripBookingAPI } from "../lib/api";

// นำ Type มาใช้ (เพื่อให้โค้ดอ่านง่ายและปลอดภัย)
import type { TripRequire, TripBooking } from "../types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // สถานะบทบาท
  const isUser = user?.role === 1;
  const isGuide = user?.role === 2;
  const isAdmin = user?.role === 3;

  // state สำหรับข้อมูลประวัติ
  const [myTripRequires, setMyTripRequires] = useState<TripRequire[]>([]);
  const [myBookings, setMyBookings] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // ถ้าไม่ล็อกอินให้ไปหน้าเข้าสู่ระบบ
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // โหลด “ประวัติ” จาก backend แบบง่าย ๆ
  useEffect(() => {
    if (!user) return;

    async function loadHistory() {
      setLoading(true);
      try {
        // ผู้ใช้ทั่วไป: โหลดความต้องการเที่ยวของฉัน
        if (isUser) {
          const resRequires = await tripRequireAPI.getOwn();
          if (resRequires && resRequires.data && Array.isArray(resRequires.data.tripRequires)) {
            setMyTripRequires(resRequires.data.tripRequires as TripRequire[]);
          } else {
            setMyTripRequires([]);
          }
        } else {
          setMyTripRequires([]);
        }

        // ทุกบทบาท: โหลดการจองล่าสุดของฉัน
        const resBookings = await tripBookingAPI.getAll();
        if (resBookings && resBookings.data && Array.isArray(resBookings.data.bookings)) {
          setMyBookings(resBookings.data.bookings as TripBooking[]);
        } else {
          setMyBookings([]);
        }
      } catch (err) {
        console.error("Load dashboard history error:", err);
        setMyTripRequires([]);
        setMyBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [user, isUser]);

  if (authLoading || loading) {
    return <Loading text="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  // ชื่อผู้ใช้แบบ “ชื่อเดียว”
  let displayName = "ผู้ใช้";
  if (user.FirstName) {
    displayName = user.FirstName;
  }

  // หัวข้อของแดชบอร์ด
  let dashboardTitle = "แดชบอร์ดสำหรับนักท่องเที่ยว";
  if (isGuide) {
    dashboardTitle = "แดชบอร์ดสำหรับไกด์";
  } else if (isAdmin) {
    dashboardTitle = "แดชบอร์ดสำหรับผู้ดูแลระบบ";
  }

  // เตรียมตัวแปรสำหรับแสดง 3 รายการแรกของ tripRequires
  const hasRequire1 = isUser && myTripRequires.length >= 1;
  const hasRequire2 = isUser && myTripRequires.length >= 2;
  const hasRequire3 = isUser && myTripRequires.length >= 3;

  const require1 = hasRequire1 ? myTripRequires[0] : undefined;
  const require2 = hasRequire2 ? myTripRequires[1] : undefined;
  const require3 = hasRequire3 ? myTripRequires[2] : undefined;

  // เตรียมตัวแปรสำหรับแสดง 3 รายการแรกของ bookings
  const hasBooking1 = myBookings.length >= 1;
  const hasBooking2 = myBookings.length >= 2;
  const hasBooking3 = myBookings.length >= 3;

  const booking1 = hasBooking1 ? myBookings[0] : undefined;
  const booking2 = hasBooking2 ? myBookings[1] : undefined;
  const booking3 = hasBooking3 ? myBookings[2] : undefined;

  return (
    <>
      <Navbar />

      {/* แถบหัวเพจ */}
      <div className="w-full h-24 bg-emerald-600" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">สวัสดี, {displayName}</h1>
          <p className="text-gray-600 mt-2">{dashboardTitle}</p>
        </div>

        {/* Quick Actions ตามบทบาท (เมนูคงที่ ไม่มี map/slice) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* เมนูของไกด์ */}
          {isGuide && (
            <>
              <Link
                href="/guide/browse-trips"
                className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center"
              >
                <h3 className="text-lg font-semibold mb-2">ดูความต้องการเที่ยว</h3>
                <p className="text-sm opacity-90">หาโอกาสงานใหม่</p>
              </Link>

              <Link
                href="/guide/my-offers"
                className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center"
              >
                <h3 className="text-lg font-semibold mb-2">ข้อเสนอของฉัน</h3>
                <p className="text-sm opacity-90">จัดการข้อเสนอ</p>
              </Link>
            </>
          )}

          {/* เมนูของแอดมิน */}
          {isAdmin && (
            <Link
              href="/admin"
              className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg text-center"
            >
              <h3 className="text-lg font-semibold mb-2">เข้าสู่แผงผู้ดูแล</h3>
              <p className="text-sm opacity-90">จัดการระบบและผู้ใช้งาน</p>
            </Link>
          )}

          {/* เมนูของผู้ใช้ทั่วไป */}
          {isUser && (
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

          {/* ปุ่มที่ใช้ร่วมกันทุก role */}
          <Link
            href="/trip-bookings"
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center"
          >
            <h3 className="text-lg font-semibold mb-2">การจองของฉัน</h3>
            <p className="text-sm opacity-90">ดูและจัดการการจอง</p>
          </Link>

          <Link
            href="/profile"
            className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg text-center"
          >
            <h3 className="text-lg font-semibold mb-2">โปรไฟล์</h3>
            <p className="text-sm opacity-90">แก้ไขข้อมูลส่วนตัว</p>
          </Link>
        </div>

        {/* ------- ประวัติของฉัน ------- */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* ผู้ใช้ทั่วไป: แสดงความต้องการเที่ยวของฉัน (ล่าสุด) สูงสุด 3 รายการ */}
          {isUser && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">ความต้องการเที่ยวล่าสุด</h2>
                <Link href="/user/trip-requires" className="text-blue-600 hover:text-blue-800 text-sm">
                  ดูทั้งหมด
                </Link>
              </div>

              {/* รายการที่ 1 */}
              {hasRequire1 && require1 && (
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {require1.Title ? require1.Title : "ไม่ระบุหัวข้อ"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {(require1.province_name && require1.province_name) ||
                      (require1.Province && require1.Province.Name) ||
                      "ไม่ระบุจังหวัด"}{" "}
                    • {require1.StartDate ? require1.StartDate : "-"}
                    {require1.EndDate ? " - " + require1.EndDate : ""}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {require1.Status ? require1.Status : "unknown"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {typeof require1.total_offers === "number" ? require1.total_offers : 0} ข้อเสนอ
                    </span>
                  </div>
                  <div className="mt-2 text-right">
                    <Link
                      href={"/user/trip-requires/" + require1.ID}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                </div>
              )}

              {/* รายการที่ 2 */}
              {hasRequire2 && require2 && (
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {require2.Title ? require2.Title : "ไม่ระบุหัวข้อ"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {(require2.province_name && require2.province_name) ||
                      (require2.Province && require2.Province.Name) ||
                      "ไม่ระบุจังหวัด"}{" "}
                    • {require2.StartDate ? require2.StartDate : "-"}
                    {require2.EndDate ? " - " + require2.EndDate : ""}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {require2.Status ? require2.Status : "unknown"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {typeof require2.total_offers === "number" ? require2.total_offers : 0} ข้อเสนอ
                    </span>
                  </div>
                  <div className="mt-2 text-right">
                    <Link
                      href={"/user/trip-requires/" + require2.ID}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                </div>
              )}

              {/* รายการที่ 3 */}
              {hasRequire3 && require3 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">
                    {require3.Title ? require3.Title : "ไม่ระบุหัวข้อ"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {(require3.province_name && require3.province_name) ||
                      (require3.Province && require3.Province.Name) ||
                      "ไม่ระบุจังหวัด"}{" "}
                    • {require3.StartDate ? require3.StartDate : "-"}
                    {require3.EndDate ? " - " + require3.EndDate : ""}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {require3.Status ? require3.Status : "unknown"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {typeof require3.total_offers === "number" ? require3.total_offers : 0} ข้อเสนอ
                    </span>
                  </div>
                  <div className="mt-2 text-right">
                    <Link
                      href={"/user/trip-requires/" + require3.ID}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                </div>
              )}

              {!hasRequire1 && (
                <p className="text-gray-500 text-center py-8">
                  ยังไม่มีความต้องการเที่ยว
                  <br />
                  <Link href="/user/trip-requires/create" className="text-blue-600 hover:text-blue-800">
                    สร้างความต้องการแรก
                  </Link>
                </p>
              )}
            </div>
          )}

          {/* การจองล่าสุด (ทุกบทบาท) สูงสุด 3 รายการ */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">การจองล่าสุด</h2>
              <Link href="/trip-bookings" className="text-blue-600 hover:text-blue-800 text-sm">
                ดูทั้งหมด
              </Link>
            </div>

            {/* รายการที่ 1 */}
            {hasBooking1 && booking1 && (
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900">
                  {booking1.trip_title && booking1.trip_title.length > 0
                    ? booking1.trip_title
                    : booking1.province_name && booking1.start_date
                    ? booking1.province_name + " • " + booking1.start_date
                    : "การจอง #" + String(booking1.id || booking1.ID)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  สถานะ: {booking1.status && booking1.status.length > 0 ? booking1.status : "unknown"}
                  {isGuide && booking1.user_name ? " • คู่สนทนา: " + booking1.user_name : ""}
                  {!isGuide && booking1.guide_name ? " • คู่สนทนา: " + booking1.guide_name : ""}
                </p>
                <div className="mt-2 text-right">
                  <Link
                    href={"/trip-bookings/" + String(booking1.id || booking1.ID)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            )}

            {/* รายการที่ 2 */}
            {hasBooking2 && booking2 && (
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900">
                  {booking2.trip_title && booking2.trip_title.length > 0
                    ? booking2.trip_title
                    : booking2.province_name && booking2.start_date
                    ? booking2.province_name + " • " + booking2.start_date
                    : "การจอง #" + String(booking2.id || booking2.ID)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  สถานะ: {booking2.status && booking2.status.length > 0 ? booking2.status : "unknown"}
                  {isGuide && booking2.user_name ? " • คู่สนทนา: " + booking2.user_name : ""}
                  {!isGuide && booking2.guide_name ? " • คู่สนทนา: " + booking2.guide_name : ""}
                </p>
                <div className="mt-2 text-right">
                  <Link
                    href={"/trip-bookings/" + String(booking2.id || booking2.ID)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            )}

            {/* รายการที่ 3 */}
            {hasBooking3 && booking3 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">
                  {booking3.trip_title && booking3.trip_title.length > 0
                    ? booking3.trip_title
                    : booking3.province_name && booking3.start_date
                    ? booking3.province_name + " • " + booking3.start_date
                    : "การจอง #" + String(booking3.id || booking3.ID)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  สถานะ: {booking3.status && booking3.status.length > 0 ? booking3.status : "unknown"}
                  {isGuide && booking3.user_name ? " • คู่สนทนา: " + booking3.user_name : ""}
                  {!isGuide && booking3.guide_name ? " • คู่สนทนา: " + booking3.guide_name : ""}
                </p>
                <div className="mt-2 text-right">
                  <Link
                    href={"/trip-bookings/" + String(booking3.id || booking3.ID)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            )}

            {!hasBooking1 && (
              <p className="text-gray-500 text-center py-8">ยังไม่มีการจอง</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
