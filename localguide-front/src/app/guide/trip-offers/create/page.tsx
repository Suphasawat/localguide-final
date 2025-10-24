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
  // รองรับทั้งชื่อพารามิเตอร์แบบ snake_case และ camelCase
  const tripRequireId =
    searchParams.get("trip_require_id") || searchParams.get("tripRequireId");

  const [tripRequire, setTripRequire] = useState<TripRequire | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

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

    if (user?.role !== 2) {
      router.push("/dashboard");
      return;
    }

    if (!tripRequireId) {
      router.push("/guide/trip-requires");
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
    } catch (error: any) {
      console.error("Failed to load trip require:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // เปิด modal เพื่อยืนยันก่อนส่ง
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowConfirm(true);
  };

  // เตรียมข้อมูลที่จะส่ง
  const buildOfferData = () => {
    const validUntilDate = new Date(formData.validUntil);
    const today = new Date();
    const diffTime = validUntilDate.getTime() - today.getTime();
    const validDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      trip_require_id: Number(tripRequireId),
      title: formData.title,
      description: formData.description,
      itinerary: formData.itinerary ? JSON.stringify(formData.itinerary) : '""',
      included_services: formData.includedServices
        ? JSON.stringify(formData.includedServices)
        : '""',
      excluded_services: formData.excludedServices
        ? JSON.stringify(formData.excludedServices)
        : '""',
      total_price: formData.totalPrice,
      price_breakdown: formData.priceBreakdown
        ? JSON.stringify(formData.priceBreakdown)
        : '""',
      terms: formData.terms ? JSON.stringify(formData.terms) : '""',
      payment_terms: formData.paymentTerms
        ? JSON.stringify(formData.paymentTerms)
        : '""',
      offer_notes: formData.notes || "",
      valid_days: validDays,
    };
  };

  // ยืนยันการส่งข้อเสนอจริง
  const confirmSubmit = async () => {
    setSubmitting(true);
    const offerData = buildOfferData();
    try {
      await tripOfferAPI.create(offerData);
      setShowConfirm(false);
      router.push("/guide/my-offers");
    } catch (apiError: any) {
      console.error("API Error:", apiError);
      if (apiError.response?.data?.error) {
        const errorMessage = apiError.response.data.error;
        if (errorMessage.includes("already made an offer")) {
          setError("คุณได้เสนอข้อเสนอสำหรับทริปนี้แล้ว");
        } else if (errorMessage.includes("Only guides can create offers")) {
          setError("เฉพาะไกด์เท่านั้นที่สามารถสร้างข้อเสนอได้");
        } else if (errorMessage.includes("no longer accepting offers")) {
          setError("ทริปนี้ไม่รับข้อเสนอแล้ว เนื่องจากอยู่ระหว่างการพิจารณา");
        } else {
          setError(errorMessage);
        }
      } else {
        setError("ไม่สามารถส่งข้อเสนอได้ กรุณาลองใหม่อีกครั้ง");
      }
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
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              เสนอแพ็กเกจทัวร์
            </h1>
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
                💰 งบประมาณ: {tripRequire.MinPrice} - {tripRequire.MaxPrice} บาท
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
                placeholder="วันที่ 1: เที่ยวสถานที่ A, B, C&#10;วันที่ 2: เที่ยวสถานที่ D, E, F...&#10;วันที่ 3: ช้อปปิ้งและเดินทางกลับ"
              />
              <p className="text-xs text-gray-500 mt-1">
                แยกแต่ละวันด้วยการเว้นบรรทัด
              </p>
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
                <p className="text-xs text-gray-500 mt-1">
                  แยกแต่ละบริการด้วยการเว้นบรรทัด
                </p>
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
                <p className="text-xs text-gray-500 mt-1">
                  แยกแต่ละบริการด้วยการเว้นบรรทัด
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคารวม (บาท) *
                </label>
                {tripRequire && (
                  <p className="text-sm text-gray-600 mb-1">
                    งบประมาณที่ต้องการ: {tripRequire.MinPrice} -{" "}
                    {tripRequire.MaxPrice} บาท
                  </p>
                )}
                <input
                  type="number"
                  name="totalPrice"
                  value={formData.totalPrice}
                  onChange={handleChange}
                  required
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
                {submitting ? "กำลังส่ง..." : "ตรวจสอบและส่ง"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => (submitting ? null : setShowConfirm(false))}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900">
              ยืนยันการส่งข้อเสนอ
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              ตรวจสอบรายละเอียดก่อนส่งไปยังลูกค้า
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <div className="text-gray-500">ชื่อแพ็กเกจ</div>
                <div className="font-medium text-gray-900">
                  {formData.title}
                </div>
              </div>
              <div>
                <div className="text-gray-500">จังหวัด / วัน / คน</div>
                <div className="font-medium text-gray-900">
                  {tripRequire?.Province?.Name || "-"} / {tripRequire?.Days} วัน
                  / {tripRequire?.GroupSize} คน
                </div>
              </div>
              <div>
                <div className="text-gray-500">ราคารวม</div>
                <div className="font-semibold text-gray-900">
                  ฿{formData.totalPrice.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500">ข้อเสนอมีผลถึง</div>
                <div className="font-medium text-gray-900">
                  {formData.validUntil}
                </div>
              </div>
            </div>

            {formData.description && (
              <div className="mt-4">
                <div className="text-gray-500 text-sm">รายละเอียดแพ็กเกจ</div>
                <div className="mt-1 whitespace-pre-wrap text-gray-800 max-h-40 overflow-auto rounded-md border border-gray-200 p-3">
                  {formData.description}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => (submitting ? null : setShowConfirm(false))}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                แก้ไขต่อ
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "กำลังส่ง..." : "ยืนยันส่งข้อเสนอ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
