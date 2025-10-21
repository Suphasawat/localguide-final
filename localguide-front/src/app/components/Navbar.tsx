"use client";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

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

        {/* เมนูกลาง */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <div className="flex items-center rounded-full border border-gray-300 px-6 py-3 shadow-sm bg-white">
            <div className="flex items-center gap-6">
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

              {/* ✅ ปุ่ม Admin: แสดงเฉพาะ role 3 */}
              {isAuthenticated && user?.role === 3 && (
                <Link
                  href="/admin"
                  className="px-3 py-2 text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition"
                >
                  แผงผู้ดูแล
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ส่วนขวา */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {user?.FirstName || user?.email?.split("@")[0] || "ผู้ใช้"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

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
