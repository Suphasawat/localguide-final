"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  // กัน hydration mismatch: รอให้ mount ก่อนค่อยอ่านสถานะ auth
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ใช้สถานะหลัง mount เท่านั้นสำหรับ logic ที่เปลี่ยน DOM
  const authed = mounted && isAuthenticated;

  // คำนวณข้อมูลแสดงผล (ใช้เมื่อ authed เท่านั้น)
  const isAdmin = authed && user?.role === 3;
  const isGuide = authed && user?.role === 2;
  const roleLabel = isAdmin ? "ผู้ดูแล" : isGuide ? "ไกด์" : "ผู้ใช้";
  const roleClass = isAdmin
    ? "bg-red-600"
    : isGuide
    ? "bg-blue-600"
    : "bg-gray-600";
  const displayName =
    user?.FirstName ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "ผู้ใช้";

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="relative mx-auto max-w-7xl h-[150px] px-6 flex items-center justify-between">
        {/* โลโก้ */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900"
        >
          Local Guide
        </Link>

        {/* เมนูกลาง (Capsule) — เพื่อกัน mismatch ให้โชว์โครงสร้างคงที่เสมอ แล้วค่อยสลับรายการหลัง mount */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <div className="flex items-center rounded-full border border-gray-300 px-6 py-3 shadow-sm bg-white">
            <div className="flex items-center gap-6">
              {!mounted ? (
                // skeleton คงที่ทั้ง SSR/Client
                <>
                  <div className="h-6 w-16 rounded-full bg-gray-100" />
                  <div className="h-6 w-20 rounded-full bg-gray-100" />
                  <div className="h-6 w-24 rounded-full bg-gray-100" />
                </>
              ) : (
                // หลัง mount แสดงเมนูจริงตาม role
                <>
                  {isGuide && (
                    <>
                      <Link
                        href="/"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        หน้าแรก
                      </Link>
                      <Link
                        href="/dashboard"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/guide/browse-trips"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        หาทริป
                      </Link>
                      <Link
                        href="/guide/my-offers"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        ข้อเสนอของฉัน
                      </Link>
                      <Link
                        href="/trip-bookings"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        การจอง
                      </Link>
                    </>
                  )}

                  {!isGuide && isAdmin && (
                    <>
                      <Link
                        href="/"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        หน้าแรก
                      </Link>
                      <Link
                        href="/dashboard"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        Dashboard
                      </Link>
                    </>
                  )}

                  {!isGuide && !isAdmin && (
                    <>
                      <Link
                        href="/"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        หน้าแรก
                      </Link>
                      <Link
                        href="/dashboard"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        ค้นหาไกด์
                      </Link>
                      <Link
                        href="/about"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        เกี่ยวกับเรา
                      </Link>
                      <Link
                        href="/province"
                        className="px-3 py-2 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-full transition"
                      >
                        จังหวัดรอง
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ส่วนขวา */}
        <div className="flex items-center gap-3">
          {!mounted ? (
            // skeleton คงที่
            <>
              <div className="h-9 w-24 rounded-full bg-gray-100" />
              <div className="h-9 w-28 rounded-full bg-gray-100" />
            </>
          ) : authed ? (
            <>
              <div className="text-right">
                <Link
                  href="/profile"
                  title="ไปหน้าโปรไฟล์"
                  className="text-sm font-bold text-gray-900 hover:underline hover:text-emerald-600 transition-colors"
                >
                  {displayName}
                </Link>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-gray-500">{user?.email}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${roleClass}`}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  แผงผู้ดูแล
                </Link>
              )}

              <button
                onClick={logout}
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-base font-bold text-gray-900 hover:bg-gray-100 rounded-full transition"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
