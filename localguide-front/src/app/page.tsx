"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Guide, getGuides } from "./services/guide.service";
import GuideCard from "./components/GuideCard";

export default function Home() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGuides = async () => {
      try {
        const data = await getGuides();
        setGuides(data);
      } catch (error) {
        console.error("Error loading guides:", error);
        setGuides([]);
      } finally {
        setLoading(false);
      }
    };

    loadGuides();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <Image
            src="https://s359.kapook.com/pagebuilder/f6a29d7d-b7ab-4a1e-9b79-a1ed7022f465.jpg"
            alt="Thailand Travel"
            fill
            priority
            className="object-cover"
            quality={90}
          />
          <div className="absolute inset-0 bg-gray-900/70 mix-blend-multiply" />
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            สัมผัสประสบการณ์ท่องเที่ยวกับไกด์ท้องถิ่น
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-gray-300">
            ค้นพบมุมมองใหม่ของการท่องเที่ยวกับไกด์ท้องถิ่นที่มีความเชี่ยวชาญ
            พร้อมแบ่งปันเรื่องราวและประสบการณ์ที่แตกต่าง
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/guides"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
            >
              ค้นหาไกด์ท้องถิ่น
            </Link>
            <Link
              href="/trip-requires"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-gray-900 transition-colors"
            >
              โพสต์หาไกด์
            </Link>
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-300 max-w-2xl">
              <span className="font-semibold">ค้นหาไกด์:</span>{" "}
              เลือกจากไกด์ท้องถิ่นที่มีอยู่แล้ว |
              <span className="font-semibold ml-2">โพสต์หาไกด์:</span>{" "}
              โพสต์ความต้องการของคุณแล้วรอไกด์มาเสนอราคา
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              วิธีการจองไกด์ท้องถิ่น
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              เลือกวิธีที่ใช่สำหรับคุณ
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Direct Booking */}
            <div className="bg-amber-50 rounded-lg p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 text-amber-600 mb-4">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ค้นหาและจองโดยตรง
                </h3>
                <p className="text-gray-600 mb-6">
                  เลือกไกด์จากรายการที่มีอยู่แล้ว ดูโปรไฟล์ ราคา และรีวิว
                  จากนั้นจองเลย
                </p>
                <Link
                  href="/guides"
                  className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                >
                  เริ่มค้นหาไกด์
                </Link>
              </div>
            </div>

            {/* Trip Request */}
            <div className="bg-blue-50 rounded-lg p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <svg
                    className="h-8 w-8"
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
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  โพสต์ความต้องการ
                </h3>
                <p className="text-gray-600 mb-6">
                  โพสต์รายละเอียดการเดินทางที่ต้องการ
                  แล้วรอให้ไกด์ท้องถิ่นมาเสนอราคาให้เลือก
                </p>
                <Link
                  href="/trip-requires/create"
                  className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  โพสต์ความต้องการ
                </Link>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              ขั้นตอนการจองผ่านโพสต์ความต้องการ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-lg font-bold mb-3">
                  1
                </div>
                <h4 className="font-semibold text-gray-900">
                  โพสต์ความต้องการ
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  ระบุสถานที่ วันเวลา และกิจกรรมที่ต้องการ
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-lg font-bold mb-3">
                  2
                </div>
                <h4 className="font-semibold text-gray-900">รับข้อเสนอ</h4>
                <p className="text-sm text-gray-600 mt-1">
                  ไกด์ท้องถิ่นส่งข้อเสนอราคาและรายละเอียด
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-lg font-bold mb-3">
                  3
                </div>
                <h4 className="font-semibold text-gray-900">เลือกข้อเสนอ</h4>
                <p className="text-sm text-gray-600 mt-1">
                  เลือกข้อเสนอที่ชอบและยอมรับ
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-lg font-bold mb-3">
                  4
                </div>
                <h4 className="font-semibold text-gray-900">ชำระเงิน</h4>
                <p className="text-sm text-gray-600 mt-1">
                  ชำระเงิน 100% ผ่านระบบ
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-lg font-bold mb-3">
                  5
                </div>
                <h4 className="font-semibold text-gray-900">เที่ยวและยืนยัน</h4>
                <p className="text-sm text-gray-600 mt-1">
                  เที่ยวกับไกด์และยืนยันเมื่อเสร็จสิ้น
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Trip Requests */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              ความต้องการล่าสุด
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              ดูว่าใครกำลังมองหาไกด์ท้องถิ่นอยู่บ้าง
            </p>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/trip-requires"
              className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-base font-medium rounded-md text-blue-600 hover:bg-blue-50"
            >
              ดูความต้องการทั้งหมด
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Guides Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              ไกด์ท้องถิ่นแนะนำ
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              เลือกไกด์ท้องถิ่นที่ใช่สำหรับคุณ
            </p>
          </div>

          <div className="mt-12">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.isArray(guides) &&
                  guides.map((guide, idx) => (
                    <GuideCard key={guide.ID ?? idx} guide={guide} />
                  ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <Link
                href="/guides"
                className="inline-flex items-center px-6 py-3 border-2 border-amber-600 text-base font-medium rounded-md text-amber-600 hover:bg-amber-50"
              >
                ดูไกด์ทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              ทำไมต้องเลือกไกด์ท้องถิ่น
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 mb-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ความรู้ท้องถิ่นแท้
              </h3>
              <p className="text-gray-600">
                ไกด์ของเราเป็นคนในพื้นที่ที่มีความรู้ความเข้าใจในวัฒนธรรมและประวัติศาสตร์ท้องถิ่นอย่างลึกซึ้ง
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 mb-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ประสบการณ์พิเศษ
              </h3>
              <p className="text-gray-600">
                สัมผัสประสบการณ์ท่องเที่ยวที่แตกต่างและเป็นส่วนตัว
                พร้อมเรื่องราวที่น่าจดจำ
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 mb-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ความปลอดภัยและความไว้วางใจ
              </h3>
              <p className="text-gray-600">
                ไกด์ทุกคนผ่านการคัดกรองและตรวจสอบประวัติ
                เพื่อความปลอดภัยและความไว้วางใจของผู้ใช้บริการ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
