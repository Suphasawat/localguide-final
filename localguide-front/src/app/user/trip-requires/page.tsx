"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripRequireAPI } from "../../lib/api";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import TripRequiresHeader from "@/app/components/trip-requires/TripRequiresHeader";
import TripRequireCard from "@/app/components/trip-requires/TripRequireCard";
import EmptyTripRequires from "@/app/components/trip-requires/EmptyTripRequires";
import DeleteConfirmModal from "@/app/components/trip-requires/DeleteConfirmModal";

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
  // Modal target for deletion
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);

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
    setDeleteLoading(id);
    try {
      await tripRequireAPI.delete(id);
      setSuccessMessage("ลบความต้องการทริปเรียบร้อยแล้ว");
      setTimeout(() => setSuccessMessage(""), 3000);
      setDeleteTarget(null);
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
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      case "in_review":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";
      case "assigned":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
      case "completed":
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
      case "cancelled":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <div className="mt-4 text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TripRequiresHeader
            tripRequiresCount={tripRequires.length}
            openCount={tripRequires.filter((t) => t.Status === "open").length}
            totalOffers={tripRequires.reduce(
              (sum, t) => sum + t.total_offers,
              0
            )}
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

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

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
                onDelete={(id, title) => setDeleteTarget({ id, title })}
                deleteLoading={deleteLoading}
              />
            ))}
          </div>
        )}

        <DeleteConfirmModal
          show={deleteTarget !== null}
          title={deleteTarget?.title || ""}
          loading={deleteLoading === deleteTarget?.id}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        />
      </div>
    </div>
  );
}
