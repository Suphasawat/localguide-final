"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { tripRequireAPI, tripOfferAPI } from "../../../lib/api";
import { TripRequire, TripOffer } from "../../../types";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import TripRequireHeader from "@/app/components/trip-require-detail/TripRequireHeader";
import OffersHighlight from "@/app/components/trip-require-detail/OffersHighlight";
import OffersPreview from "@/app/components/trip-require-detail/OffersPreview";
import TripRequireDetails from "@/app/components/trip-require-detail/TripRequireDetails";
import TripRequireSidebar from "@/app/components/trip-require-detail/TripRequireSidebar";
import MobileActionButtons from "@/app/components/trip-require-detail/MobileActionButtons";
import Footer from "@/app/components/Footer";

export default function TripRequireDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [tripRequire, setTripRequire] = useState<TripRequire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // โหลดข้อเสนอ
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersCount, setOffersCount] = useState(0);
  const [offersPreview, setOffersPreview] = useState<TripOffer[]>([]);

  // ลบ
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ===== โมดอลยืนยันการลบ (inline) =====
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmTitle = "ลบความต้องการทริปนี้หรือไม่?";
  const confirmMessage = "การดำเนินการนี้ไม่สามารถยกเลิกได้";

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
    } catch (_e) {
      setOffersCount(0);
      setOffersPreview([]);
    } finally {
      setOffersLoading(false);
    }
  };

  // เปิดโมดอลยืนยัน (เชื่อมกับปุ่มลบจาก Header / Mobile)
  const handleDelete = async () => {
    setConfirmOpen(true);
  };

  // ทำการลบจริงเมื่อกดยืนยันในโมดอล
  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await tripRequireAPI.delete(Number(tripId));
      setConfirmOpen(false);
      router.push("/user/trip-requires");
    } catch (error) {
      console.error("Failed to delete trip require:", error);
      setError("ไม่สามารถลบความต้องการทริปได้ กรุณาลองใหม่อีกครั้ง");
      setConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // helpers
  const getStatusColor = (status: string) => {
    if (status === "open") { return "bg-green-100 text-green-800"; }
    if (status === "in_review") { return "bg-yellow-100 text-yellow-800"; }
    if (status === "assigned") { return "bg-blue-100 text-blue-800"; }
    if (status === "completed") { return "bg-gray-100 text-gray-800"; }
    if (status === "cancelled") { return "bg-red-100 text-red-800"; }
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    if (status === "open") { return "เปิดรับข้อเสนอ"; }
    if (status === "in_review") { return "กำลังพิจารณา"; }
    if (status === "assigned") { return "เลือกไกด์แล้ว"; }
    if (status === "completed") { return "เสร็จสิ้น"; }
    if (status === "cancelled") { return "ยกเลิก"; }
    return status;
  };

  const getOfferGuideName = (o: any) => {
    const u = o?.Guide?.User;
    if (u?.FirstName || u?.LastName) {
      return `${u?.FirstName || ""} ${u?.LastName || ""}`.trim();
    } else {
      return o?.GuideName || o?.guide_name || "ไกด์ไม่ระบุชื่อ";
    }
  };

  const getOfferTitle = (o: any) => o?.Title || `ข้อเสนอจาก ${getOfferGuideName(o)}`;

  const getOfferPrice = (o: any) => {
    const q =
      o?.Quotation ||
      (Array.isArray(o?.TripOfferQuotation)
        ? o.TripOfferQuotation[o.TripOfferQuotation.length - 1]
        : null);
    const price = q?.TotalPrice ?? o?.TotalPrice;
    if (typeof price === "number") {
      return price;
    } else {
      return undefined;
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

  // สีแทบบนโมดอล (โทนอันตราย)
  const toneBar = "bg-red-600";

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <Navbar />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <TripRequireHeader
            tripRequire={tripRequire}
            offersCount={offersCount}
            offersLoading={offersLoading}
            deleteLoading={deleteLoading}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            onDelete={handleDelete}
          />

          <OffersHighlight
            tripRequire={tripRequire}
            offersCount={offersCount}
            offersLoading={offersLoading}
          />

          <OffersPreview
            tripRequire={tripRequire}
            offersPreview={offersPreview}
            getOfferTitle={getOfferTitle}
            getOfferGuideName={getOfferGuideName}
            getOfferPrice={getOfferPrice}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TripRequireDetails tripRequire={tripRequire} />
            </div>
            <div className="lg:col-start-3">
              <TripRequireSidebar tripRequire={tripRequire} />
            </div>
          </div>

          <MobileActionButtons
            tripRequire={tripRequire}
            offersCount={offersCount}
            offersLoading={offersLoading}
            deleteLoading={deleteLoading}
            onDelete={handleDelete}
          />
        </div>
      </div>
      <Footer />

      {/* ===== โมดอลยืนยันการลบ (แทน window.confirm) ===== */}
      {confirmOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              // ป้องกันกดพื้นหลังปิด ถ้าอยากปิดให้เปิดบรรทัดถัดไป
              // setConfirmOpen(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className={`${toneBar} h-2 rounded-t-2xl`} />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">{confirmTitle}</h3>
              <p className="mt-2 text-gray-700">{confirmMessage}</p>
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => {
                    setConfirmOpen(false);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? "กำลังลบ..." : "ลบเลย"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
