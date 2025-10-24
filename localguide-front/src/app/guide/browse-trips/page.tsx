"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripRequireAPI } from "../../lib/api";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface TripRequire {
  ID: number;
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string;
  EndDate: string;
  Days: number;
  GroupSize: number;
  Status: string;
  // จาก API /browse/trip-requires จะได้เป็นชื่อแบบ flat ไม่ได้ preload relations
  province_name?: string;
  user_name?: string;
  // บางกรณี API อื่นอาจ preload relations ไว้ ให้กำหนดเป็น optional
  Province?: {
    ID: number;
    Name: string;
  };
  User?: {
    ID: number;
    FirstName: string;
    LastName: string;
  };
}

export default function BrowseTripsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tripRequires, setTripRequires] = useState<TripRequire[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return; // wait until auth resolved

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (user?.role !== 2) {
      router.replace("/dashboard");
      return;
    }

    loadTripRequires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated, authLoading]);

  const getProvinceText = (trip: TripRequire) =>
    (
      trip.province_name ||
      trip.Province?.Name ||
      (trip as any)?.ProvinceName ||
      ""
    ).toString();

  const getUserNameText = (trip: TripRequire) => {
    // API /browse/trip-requires ส่ง field เป็น user_name
    const flat = (trip.user_name ||
      (trip as any)?.UserName ||
      (trip as any)?.user ||
      "") as string;
    if (flat && typeof flat === "string") return flat.trim();
    // เผื่อกรณี preload User
    if (trip.User) {
      return `${trip.User.FirstName ?? ""} ${trip.User.LastName ?? ""}`.trim();
    }
    return "";
  };

  const loadTripRequires = async () => {
    try {
      const response = await tripRequireAPI.browse();
      const body = response?.data;
      const list =
        body?.tripRequires ??
        body?.trip_requires ??
        (Array.isArray(body) ? body : []);
      setTripRequires(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load trip requires:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setDataLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังตรวจสอบสิทธิ์...</div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              ความต้องการทริป
            </h1>
            <p className="mt-2 text-gray-600">
              ดูความต้องการเที่ยวจากลูกค้าและเสนอแพ็กเกจของคุณ
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {tripRequires.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                ไม่มีความต้องการทริปในขณะนี้
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tripRequires.map((trip) => (
                <div
                  key={trip.ID}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {trip.Title}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {trip.Status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {trip.Description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div>📍 {getProvinceText(trip) || "ไม่ระบุจังหวัด"}</div>
                      <div>
                        👤 {getUserNameText(trip) || "ผู้ใช้ไม่ระบุชื่อ"}
                      </div>
                      <div>👥 {trip.GroupSize} คน</div>
                      <div>📅 {trip.Days} วัน</div>
                      <div>
                        💰 {trip.MinPrice.toLocaleString()} -{" "}
                        {trip.MaxPrice.toLocaleString()} บาท
                      </div>
                      <div>
                        📆{" "}
                        {new Date(trip.StartDate).toLocaleDateString("th-TH")} -{" "}
                        {new Date(trip.EndDate).toLocaleDateString("th-TH")}
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <Link
                        href={`/guide/trip-requires/${trip.ID}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        ดูรายละเอียด
                      </Link>
                      <Link
                        href={`/guide/trip-offers/create?trip_require_id=${trip.ID}`}
                        className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                      >
                        เสนอแพ็กเกจ
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
