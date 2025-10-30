"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripRequireAPI } from "../../lib/api";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TripRequiresHeader from "@/app/components/trip-requires/TripRequiresHeader";
import TripRequireCard from "@/app/components/trip-requires/TripRequireCard";
import EmptyTripRequires from "@/app/components/trip-requires/EmptyTripRequires";
import DeleteConfirmModal from "@/app/components/trip-requires/DeleteConfirmModal";

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
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  // ===== Inline Notification Modal (แทน alert) =====
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifTone, setNotifTone] = useState<"success" | "error" | "info">("info");
  const [notifPrimaryText, setNotifPrimaryText] = useState("ตกลง");
  const [notifPrimaryAction, setNotifPrimaryAction] = useState<(() => void) | null>(null);

  function openNotif(
    title: string,
    message: string,
    tone: "success" | "error" | "info" = "info",
    primaryText?: string,
    onPrimary?: () => void
  ) {
    setNotifTitle(title);
    setNotifMessage(message);
    setNotifTone(tone);
    if (primaryText) {
      setNotifPrimaryText(primaryText);
    } else {
      setNotifPrimaryText("ตกลง");
    }
    if (onPrimary) {
      setNotifPrimaryAction(() => onPrimary);
    } else {
      setNotifPrimaryAction(null);
    }
    setNotifOpen(true);
  }

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
      openNotif("โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteLoading(id);
    try {
      await tripRequireAPI.delete(id);
      setDeleteTarget(null);
      await loadTripRequires();
      openNotif("สำเร็จ", "ลบความต้องการทริปเรียบร้อยแล้ว", "success");
    } catch (error) {
      console.error("Failed to delete trip require:", error);
      openNotif("ลบไม่สำเร็จ", "ไม่สามารถลบได้ กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "open") {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    } else if (status === "in_review") {
      return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";
    } else if (status === "assigned") {
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    } else if (status === "completed") {
      return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
    } else if (status === "cancelled") {
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    } else {
      return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    if (status === "open") {
      return "เปิดรับข้อเสนอ";
    } else if (status === "in_review") {
      return "กำลังพิจารณา";
    } else if (status === "assigned") {
      return "เลือกไกด์แล้ว";
    } else if (status === "completed") {
      return "เสร็จสิ้น";
    } else if (status === "cancelled") {
      return "ยกเลิก";
    } else {
      return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <div className="mt-4 text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  // สีแถบบนของโมดอลตาม tone
  let toneBar = "bg-emerald-600";
  if (notifTone === "error") {
    toneBar = "bg-red-600";
  }
  if (notifTone === "info") {
    toneBar = "bg-amber-600";
  }

  return (
    <>
      <div className="min-h-screen bg-white py-8">
        <Navbar />

        {/* ✅ แถบสีเขียวเต็มความกว้าง */}
        <div className="w-full h-24 bg-emerald-600" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TripRequiresHeader
              tripRequiresCount={tripRequires.length}
              openCount={tripRequires.filter((t) => t.Status === "open").length}
              totalOffers={tripRequires.reduce((sum, t) => sum + t.total_offers, 0)}
            />
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full hover:bg-gray-50 transition-all font-medium shadow-sm"
              >
                <span>←</span>
                <span>กลับไป Dashboard</span>
              </Link>
              <Link
                href="/user/trip-requires/create"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-all font-medium shadow-sm"
              >
                <span>+</span>
                <span>โพสต์ความต้องการใหม่</span>
              </Link>
            </div>
          </div>

          {tripRequires.length === 0 ? (
            <EmptyTripRequires />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tripRequires.map((trip) => (
                <TripRequireCard
                  key={trip.ID}
                  trip={trip}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  onDelete={(id, title) => {
                    setDeleteTarget({ id, title });
                  }}
                  deleteLoading={deleteLoading}
                />
              ))}
            </div>
          )}

          <DeleteConfirmModal
            show={deleteTarget !== null}
            title={deleteTarget?.title || ""}
            loading={deleteLoading === deleteTarget?.id}
            onClose={() => {
              setDeleteTarget(null);
            }}
            onConfirm={() => {
              if (deleteTarget) {
                handleDelete(deleteTarget.id);
              }
            }}
          />
        </div>
      </div>

      <Footer />

      {/* ===== Inline Notification Modal (แทน alert) ===== */}
      {notifOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setNotifOpen(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className={`${toneBar} h-2 rounded-t-2xl`} />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">{notifTitle}</h3>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{notifMessage}</p>
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (notifPrimaryAction) {
                      notifPrimaryAction();
                    } else {
                      setNotifOpen(false);
                    }
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {notifPrimaryText}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
