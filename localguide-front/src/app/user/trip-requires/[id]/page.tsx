"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { tripRequireAPI } from "../../../lib/api";
import { TripRequire } from "../../../types";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export default function TripRequireDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tripRequire, setTripRequire] = useState<TripRequire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const tripId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== 1) {
      router.push("/dashboard");
      return;
    }

    loadTripRequire();
  }, [user, isAuthenticated, router, tripId, user?.id]);

  const loadTripRequire = async () => {
    try {
      const response = await tripRequireAPI.getById(Number(tripId));
      const data = response.data?.data;

      // ตรวจสอบว่าเป็นเจ้าของ trip require หรือไม่
      if (data && data.UserID !== user?.id) {
        setError("คุณไม่มีสิทธิ์เข้าดูข้อมูลนี้");
        return;
      }

      setTripRequire(data);
    } catch (error: any) {
      console.error("Failed to load trip require:", error);
      if (error.response?.status === 404) {
        setError("ไม่พบข้อมูลความต้องการทริป");
      } else if (error.response?.status === 403) {
        setError("คุณไม่มีสิทธิ์เข้าดูข้อมูลนี้");
      } else {
        setError("ไม่สามารถโหลดข้อมูลได้");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "คุณต้องการลบความต้องการทริปนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้"
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    try {
      await tripRequireAPI.delete(Number(tripId));
      router.push("/user/trip-requires");
    } catch (error) {
      console.error("Failed to delete trip require:", error);
      setError("ไม่สามารถลบความต้องการทริปได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in_review":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "เปิดรับข้อเสนอ";
      case "in_review":
        return "กำลังพิจารณา";
      case "assigned":
        return "เลือกไกด์แล้ว";
      case "completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="mt-4 text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  if (error || !tripRequire) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <p className="text-gray-500 text-lg mb-4">
            {error || "ไม่พบข้อมูลความต้องการทริป"}
          </p>
          <Link
            href="/user/trip-requires"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            กลับไปหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/dashboard" className="hover:text-gray-700">
              หน้าหลัก
            </Link>
            <svg
              className="w-4 h-4 mx-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link href="/user/trip-requires" className="hover:text-gray-700">
              ความต้องการทริป
            </Link>
            <svg
              className="w-4 h-4 mx-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-gray-900">{tripRequire.Title}</span>
          </nav>

          <div className="flex items-center mb-4">
            <Link
              href="/user/trip-requires"
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              กลับ
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {tripRequire.Title}
              </h1>
              <span
                className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                  tripRequire.Status
                )}`}
              >
                {getStatusText(tripRequire.Status)}
              </span>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex sm:hidden space-x-2 w-full">
              <Link
                href={`/user/trip-requires/${tripRequire.ID}/offers`}
                className="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                ดูข้อเสนอ
              </Link>
              {tripRequire.Status === "open" && (
                <Link
                  href={`/user/trip-requires/${tripRequire.ID}/edit`}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  แก้ไข
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                รายละเอียดความต้องการ
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {tripRequire.Description}
              </p>
            </div>

            {/* Requirements Card */}
            {tripRequire.Requirements && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  ความต้องการพิเศษ
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {tripRequire.Requirements}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ข้อมูลทริป
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">📍 จังหวัด:</span>
                  <span className="font-medium text-right">
                    {tripRequire.Province?.Name || "ไม่ระบุ"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">👥 จำนวนคน:</span>
                  <span className="font-medium">
                    {tripRequire.GroupSize} คน
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">📅 จำนวนวัน:</span>
                  <span className="font-medium">{tripRequire.Days} วัน</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">💰 งบประมาณ:</span>
                  <span className="font-medium text-right">
                    {tripRequire.MinPrice.toLocaleString()}
                    <br />- {tripRequire.MaxPrice.toLocaleString()} บาท
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">⭐ Rating ขั้นต่ำ:</span>
                  <span className="font-medium">
                    {tripRequire.MinRating} ดาว
                  </span>
                </div>
              </div>
            </div>

            {/* Date Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                วันที่
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">📅 วันเริ่ม:</span>
                  <div className="font-medium">
                    {new Date(tripRequire.StartDate).toLocaleDateString(
                      "th-TH",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">📅 วันสิ้นสุด:</span>
                  <div className="font-medium">
                    {new Date(tripRequire.EndDate).toLocaleDateString("th-TH", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">📝 โพสต์เมื่อ:</span>
                  <div className="font-medium">
                    {new Date(tripRequire.PostedAt).toLocaleDateString("th-TH")}
                  </div>
                </div>
                {tripRequire.ExpiresAt && (
                  <div>
                    <span className="text-gray-600">⏰ หมดอายุ:</span>
                    <div className="font-medium">
                      {new Date(tripRequire.ExpiresAt).toLocaleDateString(
                        "th-TH"
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Desktop Only */}
            <div className="hidden sm:block space-y-3">
              <Link
                href={`/user/trip-requires/${tripRequire.ID}/offers`}
                className="w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors block"
              >
                ดูข้อเสนอที่ได้รับ
              </Link>

              {tripRequire.Status === "open" && (
                <>
                  <Link
                    href={`/user/trip-requires/${tripRequire.ID}/edit`}
                    className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors block"
                  >
                    แก้ไขความต้องการ
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? "กำลังลบ..." : "ลบความต้องการ"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons - Bottom Fixed */}
        {tripRequire.Status === "open" && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2">
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading ? "กำลังลบ..." : "ลบความต้องการ"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
