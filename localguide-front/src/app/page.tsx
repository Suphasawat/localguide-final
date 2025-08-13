"use client";

import Link from "next/link";
import { useAuth } from "./contexts/AuthContext";
import Loading from "./components/Loading";

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading text="Loading..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ยินดีต้อนรับสู่ LocalGuide
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          เชื่อมต่อนักท่องเที่ยวกับไกด์ท้องถิ่น
          สำหรับประสบการณ์การเดินทางที่แท้จริง
        </p>

        {!isAuthenticated ? (
          <div className="space-x-4">
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
            >
              เริ่มต้นใช้งาน
            </Link>
            <Link
              href="/auth/login"
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            {user?.role?.name === "guide" ? (
              <>
                <Link
                  href="/guide/trip-requires"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg"
                >
                  ดูความต้องการเที่ยว
                </Link>
                <Link
                  href="/dashboard"
                  className="border border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg text-lg"
                >
                  แดชบอร์ด
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/user/trip-requires/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
                >
                  โพสต์ความต้องการเที่ยว
                </Link>
                <Link
                  href="/dashboard"
                  className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg"
                >
                  แดชบอร์ด
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 py-16">
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗺️</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">โพสต์ความต้องการ</h3>
          <p className="text-gray-600">
            บอกรายละเอียดการเที่ยวที่คุณต้องการ ไกด์จะมาเสนอแผนให้
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">เลือกไกด์ที่ใช่</h3>
          <p className="text-gray-600">
            เปรียบเทียบข้อเสนอจากไกด์หลายคน แล้วเลือกที่ถูกใจที่สุด
          </p>
        </div>

        <div className="text-center">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💳</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">ชำระเงินปลอดภัย</h3>
          <p className="text-gray-600">
            ระบบการชำระเงินที่ปลอดภัย จ่ายแบบเป็นขั้นตอน
          </p>
        </div>
      </div>

      {/* Call to Action */}
      {isAuthenticated && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            สวัสดี, {user?.first_name} {user?.last_name}!
          </h2>
          <p className="text-gray-600 mb-6">
            {user?.role?.name === "guide"
              ? "พร้อมช่วยนักท่องเที่ยวสำรวจความงามของท้องถิ่นแล้วหรือยัง?"
              : "พร้อมเริ่มต้นการผจญภัยใหม่แล้วหรือยัง?"}
          </p>
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            ไปยังแดชบอร์ด
          </Link>
        </div>
      )}
    </div>
  );
}
