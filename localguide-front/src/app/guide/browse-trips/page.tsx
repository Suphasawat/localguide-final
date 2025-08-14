"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripRequireAPI } from "../../lib/api";
import Link from "next/link";

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
  Province: {
    ID: number;
    Name: string;
  };
  User: {
    ID: number;
    FirstName: string;
    LastName: string;
  };
}

export default function BrowseTripsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tripRequires, setTripRequires] = useState<TripRequire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== 2) {
      router.push("/dashboard");
      return;
    }

    loadTripRequires();
  }, [user, isAuthenticated, router]);

  const loadTripRequires = async () => {
    try {
      const response = await tripRequireAPI.browse();
      setTripRequires(response.data?.trip_requires || []);
    } catch (error) {
      console.error("Failed to load trip requires:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ความต้องการทริป</h1>
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
                    <div>📍 {trip.Province?.Name}</div>
                    <div>
                      👤 {trip.User?.FirstName} {trip.User?.LastName}
                    </div>
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
  );
}
