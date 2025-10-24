"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { provinceAPI, tripRequireAPI } from "../../../lib/api";
import { Province, CreateTripRequireData } from "../../../types";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export default function CreateTripRequirePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CreateTripRequireData>({
    province_id: 0,
    title: "",
    description: "",
    min_price: 0,
    max_price: 0,
    start_date: "",
    end_date: "",
    days: 1,
    min_rating: 0,
    group_size: 1,
    requirements: "",
    expires_at: "",
  });

  useEffect(() => {
    if (authLoading) return; // รอ auth ให้เสร็จก่อน
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    loadProvinces();
  }, [isAuthenticated, authLoading, router]);

  const loadProvinces = async () => {
    try {
      const response = await provinceAPI.getAll();
      setProvinces(response.data.provinces || []);
    } catch (error) {
      console.error("Failed to load provinces:", error);
      setProvinces([]); // ป้องกัน map error
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Helper: แปลงวันที่จาก input type=date (YYYY-MM-DD) เป็นรูปแบบที่ backend ต้องการ (DD/MM/YYYY)
  const toBackendDate = (s: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split("-");
      return `${d}/${m}/${y}`;
    }
    return s; // กรณีผู้ใช้กรอกเป็น DD/MM/YYYY ไว้อยู่แล้ว
  };

  // คำนวณจำนวนวันอัตโนมัติเมื่อเลือกช่วงวันที่ครบ
  useEffect(() => {
    const { start_date, end_date } = formData;
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(start_date) &&
      /^\d{4}-\d{2}-\d{2}$/.test(end_date)
    ) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diff =
          Math.round(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        if (diff !== formData.days) {
          setFormData((prev) => ({ ...prev, days: diff }));
        }
      }
    }
  }, [formData.start_date, formData.end_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.start_date ||
      !formData.end_date
    ) {
      setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      setLoading(false);
      return;
    }

    if (formData.province_id === 0) {
      setError("กรุณาเลือกจังหวัด");
      setLoading(false);
      return;
    }

    if (formData.min_price >= formData.max_price) {
      setError("ราคาสูงสุดต้องมากกว่าราคาต่ำสุด");
      setLoading(false);
      return;
    }

    // Map form data to backend expected format (แปลงวันที่)
    const tripRequireData = {
      province_id: formData.province_id,
      title: formData.title,
      description: formData.description,
      min_price: formData.min_price,
      max_price: formData.max_price,
      start_date: toBackendDate(formData.start_date),
      end_date: toBackendDate(formData.end_date),
      days: formData.days,
      min_rating: formData.min_rating,
      group_size: formData.group_size,
      requirements: formData.requirements,
      expires_at: formData.expires_at ? toBackendDate(formData.expires_at) : "",
    };

    try {
      const response = await tripRequireAPI.create(tripRequireData);
      if (response.data) {
        router.push("/user/trip-requires");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const errorResponse = err as {
          response?: { data?: { error?: string } };
        };
        setError(
          errorResponse.response?.data?.error ||
            "เกิดข้อผิดพลาดในการสร้างความต้องการ"
        );
      } else {
        setError("เกิดข้อผิดพลาดในการสร้างความต้องการ");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "province_id" ||
        name === "min_price" ||
        name === "max_price" ||
        name === "days" ||
        name === "group_size"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const isPriceInvalid =
    formData.min_price > 0 &&
    formData.max_price > 0 &&
    formData.min_price >= formData.max_price;
  const isDateRangeInvalid = (() => {
    const { start_date, end_date } = formData;
    if (!start_date || !end_date) return false; // ให้ผู้ใช้กรอกครบก่อน
    const s = new Date(start_date);
    const e = new Date(end_date);
    return isNaN(s.getTime()) || isNaN(e.getTime()) || e < s;
  })();

  if (authLoading || loadingProvinces) {
    return <Loading text="Loading form..." />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100dvh-120px)] bg-gray-100 px-4 py-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            {/* Card Header */}
            <div className="flex items-center justify-between px-6 py-5 sm:px-8 bg-white border-b border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                สร้างความต้องการเที่ยวใหม่
              </h1>
              <Link
                href="/dashboard"
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                ← กลับไป Dashboard
              </Link>
            </div>

            {/* Card Body */}
            <div className="px-6 py-6 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หัวข้อ *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น หาไกด์เที่ยวเชียงใหม่ 3 วัน 2 คืน"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รายละเอียด *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="อธิบายรายละเอียดการเที่ยวที่คุณต้องการ"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จังหวัด *
                  </label>
                  <select
                    name="province_id"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.province_id}
                    onChange={handleChange}
                  >
                    <option value={0}>เลือกจังหวัด</option>
                    {provinces.map((province) => (
                      <option key={province.ID} value={province.ID}>
                        {province.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ราคาต่ำสุด (บาท) *
                    </label>
                    <input
                      type="number"
                      name="min_price"
                      required
                      min={0}
                      step={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.min_price}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ราคาสูงสุด (บาท) *
                    </label>
                    <input
                      type="number"
                      name="max_price"
                      required
                      min={0}
                      step={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.max_price}
                      onChange={handleChange}
                    />
                    {isPriceInvalid && (
                      <p className="mt-1 text-sm text-red-600">
                        ราคาสูงสุดต้องมากกว่าราคาต่ำสุด
                      </p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วันเริ่มต้น *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วันสิ้นสุด *
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                    {isDateRangeInvalid && (
                      <p className="mt-1 text-sm text-red-600">
                        วันสิ้นสุดต้องไม่เร็วกว่าวันเริ่มต้น
                      </p>
                    )}
                  </div>
                </div>

                {/* Days and Group Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      จำนวนวัน *
                    </label>
                    <input
                      type="number"
                      name="days"
                      required
                      min={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.days}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      ระบบจะคำนวณอัตโนมัติจากช่วงวันที่
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      จำนวนคน *
                    </label>
                    <input
                      type="number"
                      name="group_size"
                      required
                      min={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.group_size}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คะแนนไกด์ขั้นต่ำ
                  </label>
                  <select
                    name="min_rating"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.min_rating}
                    onChange={handleChange}
                  >
                    <option value={0}>ไม่กำหนด</option>
                    <option value={3}>3 ดาวขึ้นไป</option>
                    <option value={4}>4 ดาวขึ้นไป</option>
                    <option value={4.5}>4.5 ดาวขึ้นไป</option>
                  </select>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ความต้องการพิเศษ
                  </label>
                  <textarea
                    name="requirements"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น ต้องการไกด์พูดภาษาอังกฤษได้, มีรถรับส่ง"
                    value={formData.requirements}
                    onChange={handleChange}
                  />
                </div>

                {/* Expires At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันหมดอายุโพสต์
                  </label>
                  <input
                    type="date"
                    name="expires_at"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.expires_at}
                    onChange={handleChange}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      isPriceInvalid ||
                      isDateRangeInvalid ||
                      !formData.title ||
                      !formData.description ||
                      !formData.province_id
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50"
                  >
                    {loading ? "กำลังสร้าง..." : "สร้างความต้องการ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
