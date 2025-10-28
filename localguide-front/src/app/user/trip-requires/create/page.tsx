"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Loading from "@/app/components/Loading";
import TripRequireForm from "@/app/components/trip-require-form/TripRequireForm";
import { useTripRequireForm } from "@/app/components/trip-require-form/useTripRequireForm";
import { useAuth } from "../../../contexts/AuthContext";
import { provinceAPI, tripRequireAPI } from "../../../lib/api";
import { Province } from "../../../types";

export default function CreateTripRequirePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(true);

  const {
    formData,
    handleChange,
    isPriceInvalid,
    isDateRangeInvalid,
    isExpireAfterStart,
    toBackendDate,
  } = useTripRequireForm();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    loadProvinces();
  }, [isAuthenticated, authLoading, router]);

  async function loadProvinces() {
    try {
      const res = await provinceAPI.getAll();
      setProvinces(res.data.provinces || []);
    } catch (_error: unknown) {
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (
      !formData.title ||
      !formData.description ||
      !formData.start_date ||
      !formData.end_date
    ) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    if (formData.province_id === 0) {
      alert("กรุณาเลือกจังหวัด");
      return;
    }
    if (formData.min_price >= formData.max_price) {
      alert("ราคาสูงสุดต้องมากกว่าราคาต่ำสุด");
      return;
    }
    if (isExpireAfterStart) {
      alert("วันหมดอายุโพสต์ต้องไม่ช้ากว่าวันเริ่มต้นทริป");
      return;
    }

    const payload = {
      province_id: formData.province_id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      min_price: Math.max(0, formData.min_price),
      max_price: Math.max(0, formData.max_price),
      start_date: toBackendDate(formData.start_date),
      end_date: toBackendDate(formData.end_date),
      days: Math.max(1, formData.days),
      min_rating: formData.min_rating,
      group_size: Math.max(1, formData.group_size),
      requirements: formData.requirements.trim(),
      expires_at: formData.expires_at ? toBackendDate(formData.expires_at) : "",
    };

    setLoading(true);
    try {
      const res = await tripRequireAPI.create(payload);
      if (res.data) {
        alert("สร้างความต้องการทริปสำเร็จ!");
        router.push("/user/trip-requires");
      } else {
        alert("ไม่สามารถสร้างความต้องการได้");
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "เกิดข้อผิดพลาดในการสร้างความต้องการ"
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loadingProvinces) {
    return <Loading text="กำลังโหลดแบบฟอร์ม..." />;
  }

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-200px)] bg-white px-4 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="bg-emerald-600 px-8 py-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">
                    สร้างใหม่
                  </p>
                  <h1 className="mt-1 text-3xl font-extrabold">
                    สร้างความต้องการเที่ยวใหม่
                  </h1>
                  <p className="mt-2 text-emerald-50">
                    กรอกรายละเอียดเพื่อค้นหาไกด์ที่เหมาะสม
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex rounded-full bg-white/90 hover:bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition shadow-sm"
                >
                  ← กลับ
                </Link>
              </div>
            </div>

            <div className="px-8 py-8">
              <TripRequireForm
                formData={formData}
                provinces={provinces}
                loading={loading}
                onSubmit={handleSubmit}
                onChange={handleChange}
                onCancel={() => router.back()}
                submitButtonText="สร้างความต้องการ"
                isPriceInvalid={isPriceInvalid}
                isDateRangeInvalid={isDateRangeInvalid}
                isExpireAfterStart={isExpireAfterStart}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
