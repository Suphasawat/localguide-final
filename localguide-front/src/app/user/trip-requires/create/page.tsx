"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { provinceAPI, tripRequireAPI } from "../../../lib/api";
import { Province, CreateTripRequireData } from "../../../types";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function CreateTripRequirePage() {
  const { isAuthenticated } = useAuth();
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
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    loadProvinces();
  }, [isAuthenticated, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Trip require created:", formData);

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

    try {
      // Map form data to backend expected format
      const tripRequireData = {
        province_id: formData.province_id,
        title: formData.title,
        description: formData.description,
        min_price: formData.min_price,
        max_price: formData.max_price,
        start_date: formData.start_date,
        end_date: formData.end_date,
        days: formData.days,
        min_rating: formData.min_rating,
        group_size: formData.group_size,
        requirements: formData.requirements,
        expires_at: formData.expires_at,
      };

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

  if (loadingProvinces) {
    return <Loading text="Loading form..." />;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            สร้างความต้องการเที่ยวใหม่
          </h1>

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาต่ำสุด (บาท) *
                </label>
                <input
                  type="number"
                  name="min_price"
                  required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.max_price}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันเริ่มต้น * (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  name="start_date"
                  required
                  placeholder="15/02/2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันสิ้นสุด * (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  name="end_date"
                  required
                  placeholder="17/02/2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Days and Group Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนวัน *
                </label>
                <input
                  type="number"
                  name="days"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.days}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนคน *
                </label>
                <input
                  type="number"
                  name="group_size"
                  required
                  min="1"
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
                วันหมดอายุโพสต์ (DD/MM/YYYY)
              </label>
              <input
                type="text"
                name="expires_at"
                placeholder="10/02/2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.expires_at}
                onChange={handleChange}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
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
      <Footer />
    </>
  );
}
