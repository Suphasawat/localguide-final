"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripBookingAPI } from "../lib/api";
import Link from "next/link";
import type { TripBooking as TripBookingType } from "../types";
import Navbar from "../components/Navbar";

export default function TripBookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<TripBookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    loadBookings();
  }, [user, isAuthenticated, router]);

  const loadBookings = async () => {
    try {
      const response = await tripBookingAPI.getAll();
      const data = response.data;
      const list = Array.isArray(data) ? data : data?.bookings;
      setBookings(list || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "trip_started":
        return "bg-green-100 text-green-800";
      case "trip_completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "รอชำระเงิน";
      case "paid":
        return "ชำระแล้ว";
      case "trip_started":
        return "เริ่มทริปแล้ว";
      case "trip_completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      case "no_show":
        return "ลูกค้าไม่มา";
      default:
        return status || "-";
    }
  };

  // Helpers to read from multiple possible shapes
  const getId = (b: TripBookingType) => (b as any).ID ?? (b as any).id;
  const getTitle = (b: TripBookingType) =>
    (b as any).TripOffer?.Title ||
    (b as any).trip_title ||
    (b as any).TripTitle ||
    `การจอง #${getId(b)}`;
  const getProvince = (b: TripBookingType) =>
    (b as any).TripOffer?.TripRequire?.Province?.Name ||
    (b as any).province_name ||
    (b as any).ProvinceName ||
    "-";
  const getStatusVal = (b: TripBookingType) =>
    (b as any).Status || (b as any).status || "";
  const getTotal = (b: TripBookingType) =>
    (b as any).TotalAmount ?? (b as any).total_amount ?? 0;
  const getUserName = (b: TripBookingType) => {
    const u = (b as any).User;
    if (u?.FirstName || u?.LastName)
      return `${u?.FirstName || ""} ${u?.LastName || ""}`.trim();
    return (b as any).user_name || (b as any).UserName || "-";
  };
  const getGuideName = (b: TripBookingType) => {
    const g = (b as any).Guide?.User;
    if (g?.FirstName || g?.LastName)
      return `${g?.FirstName || ""} ${g?.LastName || ""}`.trim();
    return (b as any).guide_name || (b as any).GuideName || "-";
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
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">การจองทริป</h1>
            <p className="mt-2 text-gray-600">ดูและจัดการการจองทริปของคุณ</p>
          </div>
          <Link
            href="/dashboard"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            ← กลับไป Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center">
            <div className="text-gray-700">ไม่มีการจองในขณะนี้</div>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-block border border-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                กลับไป Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => {
              const id = getId(b);
              const status = getStatusVal(b);
              return (
                <div
                  key={id}
                  className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <Link
                      href={`/trip-bookings/${id}`}
                      className="text-lg font-semibold text-blue-600 hover:underline"
                    >
                      {getTitle(b)}
                    </Link>
                    <div className="text-sm text-gray-600">
                      {getProvince(b)}
                    </div>
                    <div className="text-sm text-gray-700 mt-2">
                      ผู้จอง: {getUserName(b)} • ไกด์: {getGuideName(b)}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center gap-3">
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        status
                      )}`}
                    >
                      {getStatusText(status)}
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500">ยอดรวม</div>
                      <div className="font-medium">฿{getTotal(b)}</div>
                    </div>

                    {(
                      ["paid", "trip_started", "trip_completed"] as const
                    ).includes(status as any) && (
                      <Link
                        href={`/trip-bookings/${id}`}
                        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                      >
                        ไปหน้าทริป
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
