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
  StartDate: string; // ISO string
  EndDate: string;   // ISO string
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
  const [showSuccess, setShowSuccess] = useState(false); // แสดงโอเวอร์เลย์สำเร็จ

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

  // ตัดเวลาออกให้เป็น YYYY-MM-DD ของวันนี้ (โซนไทม์เครื่อง)
  const todayISO = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }, []);

  // helper: ตัด string ให้เหลือ yyyy-mm-dd
  function toDateOnly(isoLike: string | undefined | null): string {
    if (!isoLike) {
      return "";
    }
    // กรณีเป็น "YYYY-MM-DD" อยู่แล้ว
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoLike)) {
      return isoLike;
    }
    // กรณีเป็น ISO string
    try {
      const d = new Date(isoLike);
      if (isNaN(d.getTime())) {
        return "";
      }
      d.setHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }

  // วันที่ start/end ของทริปลูกค้าในรูปแบบ YYYY-MM-DD
  const tripStartDate = toDateOnly(tripRequire?.StartDate);
  const tripEndDate = toDateOnly(tripRequire?.EndDate);

  // max ของ validUntil = วันที่เริ่มทริป (ไม่เกินวันไปจริง)
  const maxValidUntilISO = useMemo(() => {
    if (!tripStartDate) {
      return "";
    }
    return tripStartDate;
  }, [tripStartDate]);

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
      setError("");

      const response = await tripRequireAPI.getById(Number(tripRequireIdParam));
      const data: TripRequire = response.data?.data || response.data;
      setTripRequire(data);

      // ตั้งค่าเริ่มต้นให้ title / totalPrice / validUntil
      const defaultTitle = `แพ็กเกจทัวร์ ${data.Province?.Name || ""} ${data.Days} วัน`;

      // default validUntil = วันนี้+7 แต่ต้องไม่เกินวันเริ่มทริป
      const sevenDaysLater = new Date();
      sevenDaysLater.setHours(0, 0, 0, 0);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      const sevenISO = sevenDaysLater.toISOString().slice(0, 10);
      const computedValidUntil = toDateOnly(data.StartDate)
        ? (sevenISO <= toDateOnly(data.StartDate) ? sevenISO : toDateOnly(data.StartDate))
        : sevenISO;

      setFormData((prev) => ({
        ...prev,
        title: defaultTitle.trim(),
        totalPrice: data.MinPrice,
        validUntil: computedValidUntil || todayISO,
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
    setFormData((prev) => {
      const next: any = { ...prev };
      if (name === "totalPrice") {
        next[name] = Number(value);
      } else {
        next[name] = value;
      }
      return next;
    });
  }

  // ตรวจช่วงราคาให้สอดคล้องกับงบ
  const priceOutOfRange =
    !!tripRequire &&
    (formData.totalPrice < tripRequire.MinPrice ||
      formData.totalPrice > tripRequire.MaxPrice);

  // ตรวจวันที่ validUntil: ต้องไม่ย้อนหลัง และต้องไม่เกินวันเริ่มทริป
  const validUntilTooEarly =
    !!formData.validUntil && formData.validUntil < todayISO;

  const validUntilAfterTripStart =
    !!formData.validUntil && !!maxValidUntilISO && formData.validUntil > maxValidUntilISO;

  // ตรวจว่าทริปนี้เริ่มไปแล้วหรือยัง (ถ้าเริ่มแล้ว ไม่ควรรับข้อเสนอใหม่)
  const tripAlreadyStarted =
    !!tripStartDate && tripStartDate < todayISO;

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
    if (validUntilTooEarly) {
      setError("วันที่ข้อเสนอมีผลถึง ต้องไม่น้อยกว่าวันนี้");
      return;
    }
    if (validUntilAfterTripStart) {
      setError("วันที่ข้อเสนอมีผลถึง ต้องไม่เกินวันเริ่มทริปของลูกค้า");
      return;
    }
    if (tripAlreadyStarted) {
      setError("ทริปนี้เริ่มต้นไปแล้ว ไม่สามารถส่งข้อเสนอใหม่ได้");
      return;
    }
    if (priceOutOfRange) {
      setError("ราคารวมต้องอยู่ในช่วงงบประมาณของลูกค้า");
      return;
    }

    setShowConfirm(true);
  }

  function buildOfferPayload() {
    const validUntilDate = new Date(formData.validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    validUntilDate.setHours(0, 0, 0, 0);

    const diffMs = validUntilDate.getTime() - today.getTime();
    const validDays = Math.max(1, Math.ceil(diffMs / 86400000));

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
    setError("");

    try {
      await tripOfferAPI.create(buildOfferPayload());

      // แสดงโอเวอร์เลย์ "เสนอราคาเรียบร้อยแล้ว" สั้น ๆ
      setShowSuccess(true);

      // รอ 1200ms แล้วค่อยพาไปหน้ารายการข้อเสนอของไกด์
      setTimeout(() => {
        router.push("/guide/my-offers?created=1");
      }, 1200);
    } catch (apiError: unknown) {
      console.error("Create offer error:", apiError);
      const err = apiError as {
        response?: { data?: { error?: string; details?: string } };
      };
      const msg = err?.response?.data?.error || "ไม่สามารถส่งข้อเสนอได้";
      const details = err?.response?.data?.details;

      if (msg.includes("already made an offer")) {
        setError("คุณได้เสนอข้อเสนอสำหรับทริปนี้แล้ว");
      } else if (msg.includes("Only guides can create offers")) {
        setError("เฉพาะไกด์เท่านั้นที่สามารถสร้างข้อเสนอได้");
      } else if (msg.includes("no longer accepting offers")) {
        setError("ทริปนี้ไม่รับข้อเสนอแล้ว (อาจถูกยอมรับหรือปิดรับแล้ว)");
      } else if (msg.includes("Trip requirement not found")) {
        setError("ไม่พบความต้องการทริปนี้");
      } else if (msg.includes("register as a guide")) {
        setError("คุณต้องลงทะเบียนเป็นไกด์ก่อนสร้างข้อเสนอ");
      } else if (details) {
        setError(`เกิดข้อผิดพลาด: ${msg}\n${details}`);
      } else {
        setError(`เกิดข้อผิดพลาด: ${msg}`);
      }
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

      {/* HERO */}
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
              <div>🧭 เริ่มทริป: {tripStartDate || "-"}</div>
              <div>🏁 สิ้นสุด: {tripEndDate || "-"}</div>
              <div className="md:col-span-2">
                📝 รายละเอียด: {tripRequire.Description}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 whitespace-pre-line">
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
                  max={maxValidUntilISO || undefined}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                {validUntilTooEarly && (
                  <p className="mt-1 text-xs text-rose-600">
                    วันที่ข้อเสนอมีผลถึง ต้องไม่น้อยกว่าวันนี้
                  </p>
                )}
                {validUntilAfterTripStart && (
                  <p className="mt-1 text-xs text-rose-600">
                    วันที่ข้อเสนอมีผลถึง ต้องไม่เกินวันเริ่มทริปของลูกค้า
                  </p>
                )}
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
            onClick={() => { if (!submitting) { setShowConfirm(false); } }}
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
                onClick={() => { if (!submitting) { setShowConfirm(false); } }}
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

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 mx-auto">
              <div className="h-7 w-7 rounded-full bg-emerald-500" />
            </div>
            <h4 className="mt-4 text-center text-lg font-semibold text-gray-900">
              เสนอราคาเรียบร้อยแล้ว
            </h4>
            <p className="mt-1 text-center text-sm text-gray-600">
              กำลังพาไปยังหน้ารายการข้อเสนอของคุณ...
            </p>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
