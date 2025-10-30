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

  // ===== Modal (inline ไม่ต้องสร้างไฟล์ใหม่) =====
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTone, setModalTone] = useState<"success" | "error" | "info">("info");
  const [modalPrimaryText, setModalPrimaryText] = useState("ตกลง");
  const [modalPrimaryAction, setModalPrimaryAction] = useState<(() => void) | null>(null);

  function openModal(
    title: string,
    message: string,
    tone: "success" | "error" | "info" = "info",
    primaryText?: string,
    onPrimary?: () => void
  ) {
    setModalTitle(title);
    setModalMessage(message);
    setModalTone(tone);
    if (primaryText) {
      setModalPrimaryText(primaryText);
    } else {
      setModalPrimaryText("ตกลง");
    }
    if (onPrimary) {
      setModalPrimaryAction(() => onPrimary);
    } else {
      setModalPrimaryAction(null);
    }
    setModalOpen(true);
  }

  const {
    formData,
    handleChange,
    isPriceInvalid,
    isDateRangeInvalid,
    isExpireAfterStart,
    toBackendDate,
  } = useTripRequireForm();

  useEffect(() => {
    if (authLoading) {
      return;
    }
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
    if (loading) {
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.start_date ||
      !formData.end_date
    ) {
      openModal("กรอกข้อมูลไม่ครบ", "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", "error");
      return;
    }
    if (formData.province_id === 0) {
      openModal("ยังไม่ได้เลือกจังหวัด", "กรุณาเลือกจังหวัดก่อนส่งแบบฟอร์ม", "error");
      return;
    }
    if (formData.min_price >= formData.max_price) {
      openModal("ช่วงราคาไม่ถูกต้อง", "ราคาสูงสุดต้องมากกว่าราคาต่ำสุด", "error");
      return;
    }
    if (isExpireAfterStart) {
      openModal("กำหนดวันหมดอายุไม่ถูกต้อง", "วันหมดอายุโพสต์ต้องไม่ช้ากว่าวันเริ่มต้นทริป", "error");
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
        openModal(
          "สำเร็จ",
          "สร้างความต้องการทริปสำเร็จ!",
          "success",
          "ไปที่รายการของฉัน",
          () => {
            setModalOpen(false);
            router.push("/user/trip-requires");
          }
        );
      } else {
        openModal("ไม่สำเร็จ", "ไม่สามารถสร้างความต้องการได้", "error");
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const msg =
        (err?.response?.data?.error as string) ||
        (err?.response?.data?.message as string) ||
        "เกิดข้อผิดพลาดในการสร้างความต้องการ";
      openModal("เกิดข้อผิดพลาด", msg, "error");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loadingProvinces) {
    return <Loading text="กำลังโหลดแบบฟอร์ม..." />;
  }

  // สีแถบบนตาม tone
  let toneBar = "bg-emerald-600";
  if (modalTone === "error") {
    toneBar = "bg-red-600";
  }
  if (modalTone === "info") {
    toneBar = "bg-amber-600";
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
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* ===== Inline Modal (แทน alert) ===== */}
      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setModalOpen(false); }} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className={`${toneBar} h-2 rounded-t-2xl`} />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">{modalTitle}</h3>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{modalMessage}</p>
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (modalPrimaryAction) {
                      modalPrimaryAction();
                    } else {
                      setModalOpen(false);
                    }
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {modalPrimaryText}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
