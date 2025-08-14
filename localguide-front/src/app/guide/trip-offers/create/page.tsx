"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { tripOfferAPI, tripRequireAPI } from "../../../lib/api";

interface TripRequire {
  ID: number;
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string;
  EndDate: string;
  Days: number;
  GroupSize: number;
  Province: {
    Name: string;
  };
}

export default function CreateTripOfferPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripRequireId = searchParams.get("trip_require_id");

  const [tripRequire, setTripRequire] = useState<TripRequire | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    itinerary: "",
    includedServices: "",
    excludedServices: "",
    totalPrice: 0,
    priceBreakdown: "",
    terms: "",
    paymentTerms: "",
    validUntil: "",
    notes: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.Role?.Name !== "guide") {
      router.push("/dashboard");
      return;
    }

    if (!tripRequireId) {
      router.push("/guide/browse-trips");
      return;
    }

    loadTripRequire();
  }, [user, isAuthenticated, tripRequireId, router]);

  const loadTripRequire = async () => {
    try {
      const response = await tripRequireAPI.getById(Number(tripRequireId));
      setTripRequire(response.data);

      // Set default values
      setFormData((prev) => ({
        ...prev,
        title: `แพ็กเกจทัวร์ ${response.data.Province?.Name} ${response.data.Days} วัน`,
        totalPrice: response.data.MinPrice,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      }));
    } catch (error) {
      console.error("Failed to load trip require:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const offerData = {
        TripRequireID: Number(tripRequireId),
        Title: formData.title,
        Description: formData.description,
        Itinerary: formData.itinerary,
        IncludedServices: formData.includedServices,
        ExcludedServices: formData.excludedServices,
        OfferNotes: formData.notes,
        // Quotation data
        TotalPrice: formData.totalPrice,
        PriceBreakdown: formData.priceBreakdown,
        Terms: formData.terms,
        PaymentTerms: formData.paymentTerms,
        ValidUntil: formData.validUntil,
      };

      await tripOfferAPI.create(offerData);
      router.push("/guide/my-offers");
    } catch (error) {
      console.error("Failed to create offer:", error);
      setError("ไม่สามารถส่งข้อเสนอได้");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalPrice" ? Number(value) : value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  if (!tripRequire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">ไม่พบข้อมูลความต้องการทริป</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">เสนอแพ็กเกจทัวร์</h1>
          <p className="mt-2 text-gray-600">
            เสนอแพ็กเกจสำหรับ: {tripRequire.Title}
          </p>
        </div>

        {/* Trip Require Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">ข้อมูลความต้องการ</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>📍 จังหวัด: {tripRequire.Province?.Name}</div>
            <div>👥 จำนวนคน: {tripRequire.GroupSize} คน</div>
            <div>📅 ระยะเวลา: {tripRequire.Days} วัน</div>
            <div>
              💰 งบประมาณ: {tripRequire.MinPrice.toLocaleString()} -{" "}
              {tripRequire.MaxPrice.toLocaleString()} บาท
            </div>
            <div className="md:col-span-2">
              📝 รายละเอียด: {tripRequire.Description}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อแพ็กเกจ *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียดแพ็กเกจ *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="อธิบายรายละเอียดการเที่ยวที่คุณเสนอ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              กำหนดการเที่ยว (Itinerary)
            </label>
            <textarea
              name="itinerary"
              value={formData.itinerary}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="วันที่ 1: เที่ยวสถานที่ A, B, C&#10;วันที่ 2: เที่ยวสถานที่ D, E, F..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                บริการที่รวมในแพ็กเกจ
              </label>
              <textarea
                name="includedServices"
                value={formData.includedServices}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="- รถรับส่ง&#10;- ค่าน้ำมัน&#10;- ไกด์นำเที่ยว&#10;- ประกันภัย..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                บริการที่ไม่รวมในแพ็กเกจ
              </label>
              <textarea
                name="excludedServices"
                value={formData.excludedServices}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="- ค่าอาหาร&#10;- ค่าที่พัก&#10;- ค่าเข้าสถานที่ท่องเที่ยว..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคารวม (บาท) *
              </label>
              <input
                type="number"
                name="totalPrice"
                value={formData.totalPrice}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ข้อเสนอมีผลถึง *
              </label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียดค่าใช้จ่าย
            </label>
            <textarea
              name="priceBreakdown"
              value={formData.priceBreakdown}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="- ค่าน้ำมัน: 2,000 บาท&#10;- ค่าไกด์: 3,000 บาท&#10;- อื่นๆ: 1,000 บาท"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เงื่อนไขการให้บริการ
            </label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="- ต้องชำระเงินล่วงหน้า 100%&#10;- หากยกเลิกก่อน 7 วัน คืนเงิน 50%&#10;- ประกันภัยครอบคลุม..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุเพิ่มเติม
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ข้อมูลเพิ่มเติมที่ต้องการแจ้งลูกค้า..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "กำลังส่ง..." : "ส่งข้อเสนอ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
