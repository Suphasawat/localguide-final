"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripRequireAPI } from "../../lib/api";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

// Interface สำหรับ response จาก API
interface TripRequireResponse {
  ID: number;
  UserID: number;
  ProvinceID: number;
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string;
  EndDate: string;
  Days: number;
  MinRating: number;
  GroupSize: number;
  Requirements?: string;
  Status: string;
  PostedAt: string;
  ExpiresAt?: string;
  total_offers: number;
  province_name: string;
}

export default function MyTripRequiresPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tripRequires, setTripRequires] = useState<TripRequireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== 1) {
      router.push("/dashboard");
      return;
    }

    loadTripRequires();
  }, [user, isAuthenticated, router]);

  const loadTripRequires = async () => {
    try {
      const response = await tripRequireAPI.getOwn();
      setTripRequires(response.data?.tripRequires || []);
    } catch (error) {
      console.error("Failed to load trip requires:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบความต้องการทริปนี้หรือไม่?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      await tripRequireAPI.delete(id);
      setSuccessMessage("ลบความต้องการทริปเรียบร้อยแล้ว");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadTripRequires(); // Reload data
    } catch (error) {
      console.error("Failed to delete trip require:", error);
      setError("ไม่สามารถลบได้ กรุณาลองใหม่อีกครั้ง");
      setTimeout(() => setError(""), 3000);
    } finally {
      setDeleteLoading(null);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ความต้องการทริปของฉัน
            </h1>
            <p className="mt-2 text-gray-600">
              จัดการความต้องการทริปและดูข้อเสนอที่ได้รับ
            </p>
            {tripRequires.length > 0 && (
              <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                <span>📝 ทั้งหมด {tripRequires.length} รายการ</span>
                <span>
                  💼 เปิดรับ{" "}
                  {tripRequires.filter((t) => t.Status === "open").length}{" "}
                  รายการ
                </span>
                <span>
                  📩 รวมข้อเสนอ{" "}
                  {tripRequires.reduce((sum, t) => sum + t.total_offers, 0)}{" "}
                  รายการ
                </span>
              </div>
            )}
          </div>
          <Link
            href="/user/trip-requires/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            โพสต์ความต้องการใหม่
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {tripRequires.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🏝️</div>
              <p className="text-gray-500 text-lg mb-4">
                คุณยังไม่มีความต้องการทริป
              </p>
              <p className="text-gray-400 text-sm mb-6">
                เริ่มต้นโพสต์ความต้องการทริปแรกของคุณเพื่อให้ไกด์ท้องถิ่นมาเสนอข้อเสนอ
              </p>
              <Link
                href="/user/trip-requires/create"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                โพสต์ความต้องการแรก
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tripRequires.map((trip) => (
              <div
                key={trip.ID}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {trip.Title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${getStatusColor(
                        trip.Status
                      )}`}
                    >
                      {getStatusText(trip.Status)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {trip.Description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div>📍 {trip.province_name || "ไม่ระบุจังหวัด"}</div>
                    <div>👥 {trip.GroupSize} คน</div>
                    <div>📅 {trip.Days} วัน</div>
                    <div>
                      💰 {trip.MinPrice.toLocaleString()} -{" "}
                      {trip.MaxPrice.toLocaleString()} บาท
                    </div>
                    <div>
                      📆 {new Date(trip.StartDate).toLocaleDateString("th-TH")}{" "}
                      - {new Date(trip.EndDate).toLocaleDateString("th-TH")}
                    </div>
                    <div>
                      📝 โพสต์เมื่อ:{" "}
                      {new Date(trip.PostedAt).toLocaleDateString("th-TH")}
                    </div>
                    {trip.ExpiresAt && (
                      <div>
                        ⏰ หมดอายุ:{" "}
                        {new Date(trip.ExpiresAt).toLocaleDateString("th-TH")}
                      </div>
                    )}
                    {trip.total_offers > 0 && (
                      <div className="text-blue-600 font-medium">
                        📥 มีข้อเสนอ {trip.total_offers} รายการ
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex space-x-2">
                      <Link
                        href={`/user/trip-requires/${trip.ID}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        ดูรายละเอียด
                      </Link>

                      {trip.total_offers > 0 && (
                        <Link
                          href={`/user/trip-requires/${trip.ID}/offers`}
                          className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                        >
                          ดูข้อเสนอ ({trip.total_offers})
                        </Link>
                      )}
                    </div>

                    {trip.Status === "open" && (
                      <div className="flex space-x-2">
                        <Link
                          href={`/user/trip-requires/${trip.ID}/edit`}
                          className="flex-1 bg-gray-600 text-white text-center py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          แก้ไข
                        </Link>
                        <button
                          onClick={() => handleDelete(trip.ID)}
                          disabled={deleteLoading === trip.ID}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteLoading === trip.ID ? "กำลังลบ..." : "ลบ"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
