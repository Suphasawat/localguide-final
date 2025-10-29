"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import { provinceAPI, tripRequireAPI } from "../../../../lib/api";
import { Province } from "../../../../types";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import TripRequireForm from "@/app/components/trip-require-form/TripRequireForm";
import { useTripRequireForm } from "@/app/components/trip-require-form/useTripRequireForm";

export default function EditTripRequirePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    formData,
    setFormData,
    handleChange,
    isPriceInvalid,
    isDateRangeInvalid,
    isExpireAfterStart,
    toBackendDate,
    toInputDate,
  } = useTripRequireForm();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    loadProvinces();
    if (id) loadExisting(Number(id));
  }, [isAuthenticated, authLoading, id, router]);

  async function loadProvinces() {
    try {
      const res = await provinceAPI.getAll();
      setProvinces(res.data.provinces || []);
    } catch {
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  }

  async function loadExisting(idNum: number) {
    try {
      const res = await tripRequireAPI.getById(idNum);
      const tr = res.data?.data || res.data?.tripRequire || res.data;
      if (!tr) return;

      setFormData({
        province_id: tr.ProvinceID || tr.province_id || 0,
        title: tr.Title || tr.title || "",
        description: tr.Description || tr.description || "",
        min_price: tr.MinPrice || tr.min_price || 0,
        max_price: tr.MaxPrice || tr.max_price || 0,
        start_date: toInputDate(tr.StartDate || tr.start_date || tr.startDate),
        end_date: toInputDate(tr.EndDate || tr.end_date || tr.endDate),
        days: tr.Days || tr.days || 1,
        min_rating: tr.MinRating || tr.min_rating || 0,
        group_size: tr.GroupSize || tr.group_size || 1,
        requirements: tr.Requirements || tr.requirements || "",
        expires_at: toInputDate(tr.ExpiresAt || tr.expires_at || tr.expiresAt),
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.error || err?.message || "ไม่พบข้อมูลการโพสต์"
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError("");

    if (
      !formData.title ||
      !formData.description ||
      !formData.start_date ||
      !formData.end_date
    ) {
      setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    if (formData.province_id === 0) {
      setError("กรุณาเลือกจังหวัด");
      return;
    }
    if (formData.min_price >= formData.max_price) {
      setError("ราคาสูงสุดต้องมากกว่าราคาต่ำสุด");
      return;
    }
    if (isExpireAfterStart) {
      setError("วันหมดอายุโพสต์ต้องไม่ช้ากว่าวันเริ่มต้นทริป");
      return;
    }

    const payload = {
      province_id: formData.province_id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      min_price: formData.min_price,
      max_price: formData.max_price,
      start_date: toBackendDate(formData.start_date),
      end_date: toBackendDate(formData.end_date),
      days: formData.days,
      min_rating: formData.min_rating,
      group_size: formData.group_size,
      requirements: formData.requirements.trim(),
      expires_at: formData.expires_at ? toBackendDate(formData.expires_at) : "",
    };

    setLoading(true);
    try {
      if (!id) throw new Error("Missing id");
      const res = await tripRequireAPI.update(Number(id), payload);
      if (res.data) {
        router.push("/user/trip-requires");
      } else {
        setError("ไม่สามารถแก้ไขความต้องการได้");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "เกิดข้อผิดพลาดในการแก้ไขความต้องการ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loadingProvinces)
    return <Loading text="กำลังโหลดแบบฟอร์ม..." />;

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100dvh-150px)] bg-gray-100 px-4 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="overflow-hidden rounded-[24px] border border-gray-300 bg-white shadow-sm">
            {/* Header Section */}
            <div className="bg-emerald-600 px-8 py-8 text-white flex items-center justify-between">
              <h1 className="text-3xl font-extrabold">
                แก้ไขโพสต์ความต้องการเที่ยว
              </h1>
              <Link
                href="/dashboard"
                className="rounded-full bg-white/90 hover:bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition"
              >
                ← กลับไป Dashboard
              </Link>
            </div>
            <div className="px-8 py-8">
              <TripRequireForm
                formData={formData}
                provinces={provinces}
                loading={loading}
                error={error}
                onSubmit={handleSubmit}
                onChange={handleChange}
                onCancel={() => router.back()}
                submitButtonText="บันทึกการแก้ไข"
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
