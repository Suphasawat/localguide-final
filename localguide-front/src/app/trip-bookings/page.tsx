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
  const [payingId, setPayingId] = useState<number | null>(null);

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
      console.log("Trip bookings response:", response.data);
      const data = response.data;
      const list = Array.isArray(data) ? data : data?.bookings;
      console.log("Bookings list:", list);
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

  const handlePayFromList = async (bookingId: number) => {
    try {
      setPayingId(bookingId);
      setError("");
      const resp = await tripBookingAPI.createPayment(bookingId);
      // Support both legacy and new shapes
      const cs =
        resp.data?.client_secret || resp.data?.payment?.StripeClientSecret;
      const pi =
        resp.data?.payment_intent_id ||
        resp.data?.payment?.StripePaymentIntentID;
      const amount =
        resp.data?.amount ?? resp.data?.payment?.TotalAmount ?? undefined;
      if (!cs || !pi) throw new Error("missing payment param");
      router.push(
        `/trip-bookings/${bookingId}/payment?pi=${encodeURIComponent(
          pi
        )}&cs=${encodeURIComponent(cs)}${
          amount != null ? `&amount=${encodeURIComponent(amount)}` : ""
        }`
      );
    } catch (e) {
      console.error(e);
      setError("ไม่สามารถสร้างการชำระเงินได้");
    } finally {
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-8">
          <div className="text-lg">กำลังโหลด...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-8 pb-8">
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
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ไม่มีการจองในขณะนี้
                </h3>
                {user && (
                  <div className="text-sm text-gray-600 mb-4">
                    คุณเข้าสู่ระบบในฐานะ:{" "}
                    <span className="font-medium">
                      {user.role === 1
                        ? "ผู้ใช้ทั่วไป"
                        : user.role === 2
                        ? "ไกด์"
                        : `Role ${user.role}`}
                    </span>
                  </div>
                )}

                {user?.role === 2 ? (
                  <div className="mt-6 space-y-4">
                    <p className="text-gray-700">
                      💡 การจองจะปรากฏเมื่อลูกค้ายอมรับข้อเสนอของคุณ
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
                      <p className="font-medium text-blue-900 mb-2">
                        ขั้นตอนการได้รับการจอง:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-800">
                        <li>ดูความต้องการทริปจากลูกค้า</li>
                        <li>เสนอแพ็กเกจทัวร์ของคุณ</li>
                        <li>รอลูกค้ายอมรับข้อเสนอ</li>
                        <li>เมื่อลูกค้ายอมรับ การจองจะปรากฏที่นี่</li>
                      </ol>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                      <Link
                        href="/guide/browse-trips"
                        className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-md hover:bg-emerald-700 transition-colors font-medium"
                      >
                        ดูความต้องการทริป
                      </Link>
                      <Link
                        href="/guide/my-offers"
                        className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        ดูข้อเสนอของฉัน
                      </Link>
                      <Link
                        href="/dashboard"
                        className="inline-block border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors font-medium"
                      >
                        Dashboard
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <p className="text-gray-700">
                      💡 การจองจะปรากฏเมื่อคุณยอมรับข้อเสนอจากไกด์
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
                      <p className="font-medium text-blue-900 mb-2">
                        ขั้นตอนการจองทริป:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-800">
                        <li>สร้างความต้องการทริปของคุณ</li>
                        <li>รอไกด์เสนอแพ็กเกจ</li>
                        <li>เลือกและยอมรับข้อเสนอที่ชอบ</li>
                        <li>ชำระเงินและเริ่มต้นทริป</li>
                      </ol>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                      <Link
                        href="/user/trip-requires"
                        className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        สร้างความต้องการทริป
                      </Link>
                      <Link
                        href="/dashboard"
                        className="inline-block border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors font-medium"
                      >
                        Dashboard
                      </Link>
                    </div>
                  </div>
                )}
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

                      {status === "pending_payment" && user?.role === 1 && (
                        <button
                          onClick={() => handlePayFromList(Number(id))}
                          disabled={payingId === Number(id)}
                          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {payingId === Number(id)
                            ? "กำลังสร้างการชำระเงิน..."
                            : "ชำระเงิน"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
