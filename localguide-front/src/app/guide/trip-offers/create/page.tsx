"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { tripOfferAPI, tripRequireAPI } from "../../../lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

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
  Province?: { Name: string };
}

type FormState = {
  title: string;
  description: string;
  itinerary: string;
  includedServices: string;
  excludedServices: string;
  totalPrice: number;
  priceBreakdown: string;
  terms: string;
  paymentTerms: string;
  validUntil: string; // YYYY-MM-DD
  notes: string;
};

export default function CreateTripOfferPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // รองรับทั้ง snake_case และ camelCase
  const tripRequireIdParam =
    searchParams.get("trip_require_id") || searchParams.get("tripRequireId");

  const [tripRequire, setTripRequire] = useState<TripRequire | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState<FormState>({
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

  const todayISO = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user?.role !== 2) {
      router.push("/dashboard");
      return;
    }
    if (!tripRequireIdParam) {
      router.push("/guide/trip-requires");
      return;
    }
    void loadTripRequire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role, tripRequireIdParam]);

  async function loadTripRequire() {
    try {
      setLoading(true);
      const response = await tripRequireAPI.getById(Number(tripRequireIdParam));
      const data: TripRequire = response.data?.data || response.data;
      setTripRequire(data);

      setFormData((prev) => ({
        ...prev,
        title: `แพ็กเกจทัวร์ ${data.Province?.Name || ""} ${data.Days} วัน`,
        totalPrice: data.MinPrice,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      }));
    } catch (e) {
      setError("โหลดข้อมูลความต้องการทริปล้มเหลว");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalPrice" ? Number(value) : value,
    }));
  }

  // เช็คง่าย ๆ ฝั่งหน้าเว็บ (backend ยังตรวจซ้ำ)
  const priceOutOfRange =
    !!tripRequire &&
    (formData.totalPrice < tripRequire.MinPrice ||
      formData.totalPrice > tripRequire.MaxPrice);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.description) {
      setError("กรุณากรอกชื่อแพ็กเกจและรายละเอียดให้ครบ");
      return;
    }
    if (!formData.validUntil) {
      setError("กรุณาระบุวันที่ข้อเสนอมีผลถึง");
      return;
    }
    setShowConfirm(true);
  }

  function buildOfferPayload() {
    // backend รับเป็น string ทั้งหมด ไม่ต้อง JSON.stringify
    const validUntilDate = new Date(formData.validUntil);
    const today = new Date();
    const validDays = Math.max(
      1,
      Math.ceil((validUntilDate.getTime() - today.getTime()) / 86400000)
    );

    return {
      trip_require_id: Number(tripRequireIdParam),
      title: formData.title,
      description: formData.description,
      itinerary: formData.itinerary,
      included_services: formData.includedServices,
      excluded_services: formData.excludedServices,
      total_price: formData.totalPrice,
      price_breakdown: formData.priceBreakdown,
      terms: formData.terms,
      payment_terms: formData.paymentTerms,
      offer_notes: formData.notes,
      valid_days: validDays,
    };
  }

  async function confirmSubmit() {
    setSubmitting(true);
    setShowConfirm(false); // ปิด modal ก่อน
    try {
      await tripOfferAPI.create(buildOfferPayload());
      router.push("/guide/my-offers");
    } catch (apiError: unknown) {
      console.error("Create offer error:", apiError);
      // แสดง error ที่อ่านง่าย
      const err = apiError as {
        response?: { data?: { error?: string; details?: string } };
      };
      const msg = err?.response?.data?.error || "ไม่สามารถส่งข้อเสนอได้";
      const details = err?.response?.data?.details;

      if (msg.includes("already made an offer"))
        setError("คุณได้เสนอข้อเสนอสำหรับทริปนี้แล้ว");
      else if (msg.includes("Only guides can create offers"))
        setError("เฉพาะไกด์เท่านั้นที่สามารถสร้างข้อเสนอได้");
      else if (msg.includes("no longer accepting offers"))
        setError("ทริปนี้ไม่รับข้อเสนอแล้ว (อาจถูกยอมรับหรือปิดรับแล้ว)");
      else if (msg.includes("Trip requirement not found"))
        setError("ไม่พบความต้องการทริปนี้");
      else if (msg.includes("register as a guide"))
        setError("คุณต้องลงทะเบียนเป็นไกด์ก่อนสร้างข้อเสนอ");
      else if (details) setError(`เกิดข้อผิดพลาด: ${msg}\n${details}`);
      else setError(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] grid place-items-center bg-emerald-50">
          <div className="animate-pulse text-emerald-700 font-semibold">
            กำลังโหลด...
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!tripRequire) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] grid place-items-center">
          <div className="text-rose-600">ไม่พบข้อมูลความต้องการทริป</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* HERO เขียวสดใส */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-b-xl">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-emerald-50/90 text-xs uppercase tracking-wider">
                  สำหรับไกด์
                </p>
                <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">
                  เสนอแพ็กเกจทัวร์
                </h1>
                <p className="mt-2 text-emerald-50">
                  เสนอแพ็กเกจสำหรับ: {tripRequire.Title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="bg-emerald-50/40 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Trip Require Info */}
          <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-emerald-800">
              ข้อมูลความต้องการ
            </h2>
            <div className="mt-3 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
              <div>📍 จังหวัด: {tripRequire.Province?.Name || "-"}</div>
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
            <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ชื่อแพ็กเกจ *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                รายละเอียดแพ็กเกจ *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="อธิบายรายละเอียดที่ลูกค้าจะได้รับ..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                กำหนดการเที่ยว (Itinerary)
              </label>
              <textarea
                name="itinerary"
                value={formData.itinerary}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder={`วันที่ 1: ...\nวันที่ 2: ...`}
              />
              <p className="mt-1 text-xs text-gray-500">
                แยกแต่ละวันด้วยการเว้นบรรทัด
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  บริการที่รวมในแพ็กเกจ
                </label>
                <textarea
                  name="includedServices"
                  value={formData.includedServices}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder={`- รถรับส่ง\n- ค่าน้ำมัน\n- ไกด์นำเที่ยว\n- ประกันภัย ...`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  แยกแต่ละบริการด้วยการเว้นบรรทัด
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  บริการที่ไม่รวมในแพ็กเกจ
                </label>
                <textarea
                  name="excludedServices"
                  value={formData.excludedServices}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder={`- ค่าอาหาร\n- ค่าที่พัก\n- ค่าเข้าสถานที่ ...`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  แยกแต่ละบริการด้วยการเว้นบรรทัด
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ราคารวม (บาท) *
                </label>
                {tripRequire && (
                  <p className="mb-1 text-xs text-gray-500">
                    งบประมาณที่ลูกค้าต้องการ:{" "}
                    {tripRequire.MinPrice.toLocaleString()} -{" "}
                    {tripRequire.MaxPrice.toLocaleString()} บาท
                  </p>
                )}
                <input
                  type="number"
                  name="totalPrice"
                  value={formData.totalPrice}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    priceOutOfRange
                      ? "border-rose-300 focus:ring-rose-200"
                      : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-200"
                  }`}
                />
                {priceOutOfRange && (
                  <p className="mt-1 text-xs text-rose-600">
                    ราคารวมต้องอยู่ในช่วงงบประมาณของลูกค้า
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ข้อเสนอมีผลถึง *
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  min={todayISO}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                รายละเอียดค่าใช้จ่าย
              </label>
              <textarea
                name="priceBreakdown"
                value={formData.priceBreakdown}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder={`- ค่าน้ำมัน: 2,000 บาท\n- ค่าไกด์: 3,000 บาท\n- อื่น ๆ: 1,000 บาท`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                เงื่อนไขการให้บริการ
              </label>
              <textarea
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder={`- ชำระเงินล่วงหน้า ...\n- ยกเลิกก่อน ...`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                เงื่อนไขการชำระเงิน
              </label>
              <textarea
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder={`- วางมัดจำ ...\n- ชำระส่วนที่เหลือ ...`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                หมายเหตุเพิ่มเติม
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="ข้อมูลเพิ่มเติมที่อยากแจ้งลูกค้า..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
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
                  {formData.title || "-"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">จังหวัด / วัน / คน</div>
                <div className="font-medium text-gray-900">
                  {tripRequire.Province?.Name || "-"} / {tripRequire.Days} วัน /{" "}
                  {tripRequire.GroupSize} คน
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
                  {formData.validUntil || "-"}
                </div>
              </div>
            </div>

            {formData.description && (
              <div className="mt-4">
                <div className="text-gray-500 text-sm">รายละเอียดแพ็กเกจ</div>
                <div className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-gray-200 p-3 text-gray-800">
                  {formData.description}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => (submitting ? null : setShowConfirm(false))}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                แก้ไขต่อ
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "กำลังส่ง..." : "ยืนยันส่งข้อเสนอ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
