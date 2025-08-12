"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUsers,
  FaStar,
  FaPlus,
} from "react-icons/fa";
import { MdDescription } from "react-icons/md";
import dayjs from "dayjs";
import { getUser } from "../../services/auth.service";
import {
  tripService,
  CreateTripRequireData,
} from "../../services/trip.service";

interface Province {
  ID: number;
  Name: string;
  Region: string;
}

export default function CreateTripRequirePage() {
  const [formData, setFormData] = useState<CreateTripRequireData>({
    provinceID: 0,
    title: "",
    description: "",
    minPrice: 0,
    maxPrice: 0,
    startDate: "",
    endDate: "",
    groupSize: 1,
    minRating: 0,
    requirements: "",
    touristAttractionIDs: [],
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      // Mock provinces - ในการใช้งานจริงต้องเรียก API
      setProvinces([
        { ID: 1, Name: "กรุงเทพมหานคร", Region: "กลาง" },
        { ID: 2, Name: "เชียงใหม่", Region: "เหนือ" },
        { ID: 3, Name: "ภูเก็ต", Region: "ใต้" },
        { ID: 4, Name: "ขอนแก่น", Region: "อีสาน" },
        { ID: 5, Name: "ระยอง", Region: "ตะวันออก" },
      ]);
    } catch (err: any) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลจังหวัด");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.provinceID) {
      setError("กรุณาเลือกจังหวัด");
      return;
    }

    if (!formData.title.trim()) {
      setError("กรุณาใส่หัวข้อ");
      return;
    }

    if (!formData.description.trim()) {
      setError("กรุณาใส่รายละเอียด");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("กรุณาเลือกวันที่");
      return;
    }

    if (dayjs(formData.startDate).isAfter(dayjs(formData.endDate))) {
      setError("วันเริ่มต้องไม่เกินวันสิ้นสุด");
      return;
    }

    if (formData.minPrice <= 0 || formData.maxPrice <= 0) {
      setError("กรุณาใส่งบประมาณที่ถูกต้อง");
      return;
    }

    if (formData.minPrice > formData.maxPrice) {
      setError("งบประมาณต่ำสุดต้องไม่เกินงบประมาณสูงสุด");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await tripService.createTripRequire(formData);

      alert("โพสต์ความต้องการไกด์สำเร็จ!");
      router.push("/my-trip-requires");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการสร้างโพสต์");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (
      name === "provinceID" ||
      name === "groupSize" ||
      name === "minPrice" ||
      name === "maxPrice" ||
      name === "minRating"
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            โพสต์ต้องการไกด์ท้องถิ่น
          </h1>
          <p className="mt-2 text-gray-600">
            บอกเราว่าคุณต้องการไปเที่ยวแบบไหน แล้วรอรับข้อเสนอจากไกด์มืออาชีพ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MdDescription className="mr-2 text-blue-500" />
              ข้อมูลพื้นฐาน
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หัวข้อ *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="เช่น หาไกด์เที่ยวเชียงใหม่ 3 วัน 2 คืน"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-1 text-red-500" />
                  จังหวัด *
                </label>
                <select
                  name="provinceID"
                  value={formData.provinceID}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value={0}>เลือกจังหวัด</option>
                  {provinces.map((province) => (
                    <option key={province.ID} value={province.ID}>
                      {province.Name} ({province.Region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUsers className="inline mr-1 text-purple-500" />
                  จำนวนคน *
                </label>
                <input
                  type="number"
                  name="groupSize"
                  value={formData.groupSize}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดความต้องการ *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="อธิบายรายละเอียดเพิ่มเติมเกี่ยวกับการเที่ยวที่ต้องการ เช่น สถานที่ที่อยากไป กิจกรรมที่สนใจ ฯลฯ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dates and Budget */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" />
              วันที่และงบประมาณ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันเริ่มต้น *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={dayjs().format("YYYY-MM-DD")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันสิ้นสุด *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || dayjs().format("YYYY-MM-DD")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaDollarSign className="inline mr-1 text-green-500" />
                  งบประมาณต่ำสุด (บาท) *
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  placeholder="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaDollarSign className="inline mr-1 text-green-500" />
                  งบประมาณสูงสุด (บาท) *
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={formData.maxPrice}
                  onChange={handleInputChange}
                  min={formData.minPrice || 0}
                  step="100"
                  placeholder="5000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaStar className="mr-2 text-yellow-500" />
              ความต้องการเพิ่มเติม
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {/* Min Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เรตติ้งไกด์ขั้นต่ำ (ดาว)
                </label>
                <select
                  name="minRating"
                  value={formData.minRating}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value={0}>ไม่กำหนด</option>
                  <option value={3}>3 ดาวขึ้นไป</option>
                  <option value={3.5}>3.5 ดาวขึ้นไป</option>
                  <option value={4}>4 ดาวขึ้นไป</option>
                  <option value={4.5}>4.5 ดาวขึ้นไป</option>
                  <option value={5}>5 ดาว</option>
                </select>
              </div>

              {/* Additional Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความต้องการเพิ่มเติม
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="เช่น ต้องการไกด์ที่พูดภาษาอังกฤษได้, มีรถยนต์ส่วนตัว, มีประสบการณ์เฉพาะด้าน ฯลฯ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังโพสต์...
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" />
                  โพสต์ความต้องการ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
