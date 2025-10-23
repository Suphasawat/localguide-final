"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const isAdmin = isAuthenticated && user?.role === 3;
  const isGuide = isAuthenticated && user?.role === 2;

  const displayName =
    user?.FirstName || user?.email?.split("@")[0] || "ผู้ใช้";

  return (
    <>
      <div className="w-full bg-white border-b border-gray-200">
        <div className="relative mx-auto max-w-7xl h-[150px] px-6 flex items-center justify-between">
          {/* โลโก้ */}
          <Link
            href="/"
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900"
          >
            Local Guide
          </Link>

          {/* เมนูกลาง (Capsule) */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <div className="flex items-center rounded-full border border-gray-300 px-6 py-3 shadow-sm bg-white">
              <div className="flex items-center gap-6">
                {/* เมนูสำหรับ Guide */}
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

                {/* เมนูสำหรับ Admin */}
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

                {/* เมนูสำหรับ User ทั่วไป */}
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
              </div>
            </div>
          </div>

          {/* ส่วนขวา */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{displayName}</p>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-gray-500">{user?.email}</span>
                    {/* ป้าย Role */}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${
                        isAdmin
                          ? "bg-red-600"
                          : isGuide
                          ? "bg-blue-600"
                          : "bg-gray-600"
                      }`}
                    >
                      {isAdmin ? "ผู้ดูแล" : isGuide ? "ไกด์" : "ผู้ใช้"}
                    </span>
                  </div>
                </div>

                {/* ปุ่มแผงผู้ดูแล (Admin เท่านั้น) */}
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
                  className="px-4 py-2 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}