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
          <TripRequiresHeader
            tripRequiresCount={tripRequires.length}
            openCount={tripRequires.filter((t) => t.Status === "open").length}
            totalOffers={tripRequires.reduce(
              (sum, t) => sum + t.total_offers,
              0
            )}
          />
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              ← กลับไป Dashboard
            </Link>
            <Link
              href="/user/trip-requires/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              โพสต์ความต้องการใหม่
            </Link>
          </div>
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
