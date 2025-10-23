"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { tripRequireAPI, tripOfferAPI } from "../../../lib/api";
import { TripRequire, TripOffer } from "../../../types";
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
  // Highlight offers
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersCount, setOffersCount] = useState(0);
  const [offersPreview, setOffersPreview] = useState<TripOffer[]>([]);

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
    loadOffers();
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

  const loadOffers = async () => {
    try {
      setOffersLoading(true);
      const res = await tripOfferAPI.getByRequire(Number(tripId));
      const raw = res.data;
      const list: any[] = Array.isArray(raw)
        ? raw
        : raw?.offers || raw?.data || raw?.TripOffers || [];
      setOffersCount(list?.length || 0);
      setOffersPreview((list || []).slice(0, 2));
    } catch (e) {
      setOffersCount(0);
      setOffersPreview([]);
    } finally {
      setOffersLoading(false);
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

  // Helpers for offers preview
  const getOfferGuideName = (o: any) => {
    const u = o?.Guide?.User;
    if (u?.FirstName || u?.LastName)
      return `${u?.FirstName || ""} ${u?.LastName || ""}`.trim();
    return o?.GuideName || o?.guide_name || "ไกด์ไม่ระบุชื่อ";
  };
  const getOfferTitle = (o: any) =>
    o?.Title || `ข้อเสนอจาก ${getOfferGuideName(o)}`;
  const getOfferPrice = (o: any) => {
    const q =
      o?.Quotation ||
      (Array.isArray(o?.TripOfferQuotation)
        ? o.TripOfferQuotation[o.TripOfferQuotation.length - 1]
        : null);
    const price = q?.TotalPrice ?? o?.TotalPrice;
    return typeof price === "number" ? price : undefined;
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
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                    tripRequire.Status
                  )}`}
                >
                  {getStatusText(tripRequire.Status)}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  📥 ข้อเสนอ {offersLoading ? "…" : offersCount}
                </span>
              </div>

              {/* Quick chips */}
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                  📍 {tripRequire.Province?.Name || "ไม่ระบุ"}
                </span>
                <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                  📅 {tripRequire.Days} วัน
                </span>
                <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                  💰 {tripRequire.MinPrice.toLocaleString()} -{" "}
                  {tripRequire.MaxPrice.toLocaleString()} บาท
                </span>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex sm:hidden space-x-2 w-full">
              <Link
                href={`/user/trip-requires/${tripRequire.ID}/offers`}
                className="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                ดูข้อเสนอ{offersLoading ? "" : ` (${offersCount})`}
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

        {/* Offers highlight */}
        <div className="mb-6">
          {offersLoading ? (
            <div className="animate-pulse bg-blue-50 border border-blue-200 rounded-lg p-4 h-16" />
          ) : offersCount > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="text-blue-800">
                <div className="font-semibold">
                  คุณได้รับข้อเสนอแล้ว {offersCount} รายการ
                </div>
                <div className="text-sm">
                  เลือกข้อเสนอที่เหมาะสมที่สุดสำหรับทริปของคุณ
                </div>
              </div>
              <Link
                href={`/user/trip-requires/${tripRequire.ID}/offers`}
                className="shrink-0 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                ดูข้อเสนอทั้งหมด
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          ) : (
            tripRequire.Status === "open" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                <div className="text-yellow-800">
                  <div className="font-semibold">ยังไม่มีข้อเสนอ</div>
                  <div className="text-sm">
                    ปรับรายละเอียดความต้องการให้ชัดเจนเพื่อดึงดูดไกด์มากขึ้น
                  </div>
                </div>
                <Link
                  href={`/user/trip-requires/${tripRequire.ID}/edit`}
                  className="shrink-0 inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                >
                  แก้ไขความต้องการ
                </Link>
              </div>
            )
          )}
        </div>

        {/* Offers preview cards */}
        {offersPreview.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                ข้อเสนอล่าสุด
              </h3>
              <Link
                href={`/user/trip-requires/${tripRequire!.ID}/offers`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {offersPreview.map((o) => (
                <div key={o.ID} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900 line-clamp-1">
                        {getOfferTitle(o)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        โดย {getOfferGuideName(o)}
                      </div>
                    </div>
                    {getOfferPrice(o) !== undefined && (
                      <div className="shrink-0 text-right">
                        <div className="text-xs text-gray-500">ราคาโดยรวม</div>
                        <div className="font-semibold text-gray-900">
                          ฿{getOfferPrice(o)!.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                  {o.Description && (
                    <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                      {o.Description}
                    </p>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/user/trip-requires/${tripRequire!.ID}/offers`}
                      className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                    >
                      ดูข้อเสนอนี้
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                ดูข้อเสนอที่ได้รับ{offersLoading ? "" : ` (${offersCount})`}
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
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2">
          <div className="flex gap-2">
            <Link
              href={`/user/trip-requires/${tripRequire.ID}/offers`}
              className="flex-1 bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              ดูข้อเสนอ{offersLoading ? "" : ` (${offersCount})`}
            </Link>
            {tripRequire.Status === "open" && (
              <Link
                href={`/user/trip-requires/${tripRequire.ID}/edit`}
                className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                แก้ไข
              </Link>
            )}
          </div>
          {tripRequire.Status === "open" && (
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading ? "กำลังลบ..." : "ลบความต้องการ"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
