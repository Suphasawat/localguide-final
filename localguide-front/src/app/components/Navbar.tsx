"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            LocalGuide
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="hover:text-blue-200">
                  Dashboard
                </Link>

                {user?.role === 3 && (
                  <Link href="/admin" className="hover:text-blue-200">
                    Admin
                  </Link>
                )}

                {user?.role === 2 ? (
                  <>
                    <Link
                      href="/guide/browse-trips"
                      className="hover:text-blue-200"
                    >
                      หาทริป
                    </Link>
                    <Link
                      href="/guide/my-offers"
                      className="hover:text-blue-200"
                    >
                      ข้อเสนอของฉัน
                    </Link>
                    <Link href="/trip-bookings" className="hover:text-blue-200">
                      การจอง
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/user/trip-requires"
                      className="hover:text-blue-200"
                    >
                      ทริปของฉัน
                    </Link>
                    <Link
                      href="/user/trip-requires/create"
                      className="hover:text-blue-200"
                    >
                      โพสต์ทริป
                    </Link>
                    <Link href="/trip-bookings" className="hover:text-blue-200">
                      การจอง
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm">{user?.email}</span>
                  <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-blue-200">
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
