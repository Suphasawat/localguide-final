"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tripRequireAPI } from "../../lib/api";
import { TripRequire } from "../../types";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";

export default function GuideTripRequiresPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tripRequires, setTripRequires] = useState<TripRequire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    status: "open",
    minPrice: "",
    maxPrice: "",
    province: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== 2) {
      router.push("/dashboard");
      return;
    }

    loadTripRequires();
  }, [user, authLoading, isAuthenticated, router]);

  const loadTripRequires = async () => {
    try {
      setLoading(true);
      const response = await tripRequireAPI.browse();
      setTripRequires(response.data?.tripRequires || []);
    } catch (error) {
      console.error("Failed to load trip requires:", error);
      setError("ไม่สามารถโหลดข้อมูลความต้องการเที่ยวได้");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: "bg-green-100 text-green-800",
      in_review: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const labels = {
      open: "เปิดรับข้อเสนอ",
      in_review: "กำลังพิจารณา",
      assigned: "มีไกด์แล้ว",
      completed: "เสร็จสิ้น",
      cancelled: "ยกเลิก",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysFromNow = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredTripRequires = tripRequires.filter((tripRequire) => {
    if (filter.status && tripRequire.Status !== filter.status) return false;
    if (filter.minPrice && tripRequire.MinPrice < parseInt(filter.minPrice))
      return false;
    if (filter.maxPrice && tripRequire.MaxPrice > parseInt(filter.maxPrice))
      return false;
    return true;
  });

  if (authLoading || loading) {
    return <Loading text="กำลังโหลดความต้องการเที่ยว..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ความต้องการเที่ยวทั้งหมด
          </h1>
          <p className="mt-2 text-gray-600">
            ค้นหาและเสนอข้อเสนอสำหรับลูกค้าที่ต้องการไกด์นำเที่ยว
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ตัวกรอง</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานะ
              </label>
              <select
                value={filter.status}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="open">เปิดรับข้อเสนอ</option>
                <option value="in_review">กำลังพิจารณา</option>
                <option value="assigned">มีไกด์แล้ว</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาต่ำสุด (บาท)
              </label>
              <input
                type="number"
                value={filter.minPrice}
                onChange={(e) =>
                  setFilter({ ...filter, minPrice: e.target.value })
                }
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาสูงสุด (บาท)
              </label>
              <input
                type="number"
                value={filter.maxPrice}
                onChange={(e) =>
                  setFilter({ ...filter, maxPrice: e.target.value })
                }
                placeholder="ไม่จำกัด"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilter({
                    status: "open",
                    minPrice: "",
                    maxPrice: "",
                    province: "",
                  })
                }
                className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Trip Requires List */}
        {filteredTripRequires.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🧳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ไม่มีความต้องการเที่ยว
            </h3>
            <p className="text-gray-500">
              {tripRequires.length === 0
                ? "ยังไม่มีลูกค้าโพสต์ความต้องการเที่ยว"
                : "ไม่มีความต้องการเที่ยวที่ตรงกับตัวกรองที่เลือก"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTripRequires.map((tripRequire) => (
              <div
                key={tripRequire.ID}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {tripRequire.Title}
                      </h3>
                      {getStatusBadge(tripRequire.Status)}
                    </div>
                    <p className="text-gray-600 mb-2">
                      📍 {tripRequire.Province?.Name}
                    </p>
                    <p className="text-gray-700">{tripRequire.Description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">💰 ค่าใช้จ่าย:</span>{" "}
                      {tripRequire.MinPrice.toLocaleString()} -{" "}
                      {tripRequire.MaxPrice.toLocaleString()} บาท
                    </div>
                    <div>
                      <span className="font-medium">👥 จำนวนคน:</span>{" "}
                      {tripRequire.GroupSize} คน
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">📅 วันเดินทาง:</span>{" "}
                      {formatDate(tripRequire.StartDate)}
                    </div>
                    <div>
                      <span className="font-medium">⏱️ จำนวนวัน:</span>{" "}
                      {tripRequire.Days} วัน
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">⭐ เรตติ้งต่ำสุด:</span>{" "}
                      {tripRequire.MinRating}/5
                    </div>
                    <div>
                      <span className="font-medium">📝 ข้อเสนอ:</span>{" "}
                      {tripRequire.OffersCount || 0} รายการ
                    </div>
                  </div>
                </div>

                {tripRequire.Requirements && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h4 className="font-medium text-yellow-800 mb-1">
                      ความต้องการพิเศษ:
                    </h4>
                    <p className="text-yellow-700 text-sm">
                      {tripRequire.Requirements}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    โพสต์เมื่อ: {formatDate(tripRequire.PostedAt)}
                    {tripRequire.ExpiresAt && (
                      <span className="ml-4">
                        หมดอายุใน: {calculateDaysFromNow(tripRequire.ExpiresAt)}{" "}
                        วัน
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      href={`/user/trip-requires/${tripRequire.ID}/offers`}
                      className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      ดูข้อเสนอทั้งหมด ({tripRequire.OffersCount || 0})
                    </Link>
                    {tripRequire.Status === "open" && (
                      <Link
                        href={`/guide/trip-offers/create?tripRequireId=${tripRequire.ID}`}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        เสนอข้อเสนอ
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {tripRequires.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              สรุปข้อมูล
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {tripRequires.filter((tr) => tr.Status === "open").length}
                </div>
                <div className="text-sm text-gray-600">เปิดรับข้อเสนอ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    tripRequires.filter((tr) => tr.Status === "in_review")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">กำลังพิจารณา</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {tripRequires.filter((tr) => tr.Status === "assigned").length}
                </div>
                <div className="text-sm text-gray-600">มีไกด์แล้ว</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {tripRequires.length}
                </div>
                <div className="text-sm text-gray-600">ทั้งหมด</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
