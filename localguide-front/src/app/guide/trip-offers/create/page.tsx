"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { tripOfferAPI, tripRequireAPI } from "../../../lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TripRequireInfoCard from "@/app/components/trip-offer-create/TripRequireInfoCard";
import CreateOfferForm from "@/app/components/trip-offer-create/CreateOfferForm";
import OfferConfirmModal from "@/app/components/trip-offer-create/OfferConfirmModal";
import SuccessOverlay from "@/app/components/trip-offer-create/SuccessOverlay";

interface TripRequire {
  ID: number;
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string; // ISO string
  EndDate: string; // ISO string
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
      const defaultTitle = `แพ็กเกจทัวร์ ${data.Province?.Name || ""} ${
        data.Days
      } วัน`;

      // default validUntil = วันนี้+7 แต่ต้องไม่เกินวันเริ่มทริป
      const sevenDaysLater = new Date();
      sevenDaysLater.setHours(0, 0, 0, 0);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      const sevenISO = sevenDaysLater.toISOString().slice(0, 10);
      const computedValidUntil = toDateOnly(data.StartDate)
        ? sevenISO <= toDateOnly(data.StartDate)
          ? sevenISO
          : toDateOnly(data.StartDate)
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
    !!formData.validUntil &&
    !!maxValidUntilISO &&
    formData.validUntil > maxValidUntilISO;

  // ตรวจว่าทริปนี้เริ่มไปแล้วหรือยัง (ถ้าเริ่มแล้ว ไม่ควรรับข้อเสนอใหม่)
  const tripAlreadyStarted = !!tripStartDate && tripStartDate < todayISO;

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
          {/* Trip Require Info Card Component */}
          <TripRequireInfoCard
            tripRequire={tripRequire}
            tripStartDate={tripStartDate}
            tripEndDate={tripEndDate}
          />

          {error && (
            <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 whitespace-pre-line">
              {error}
            </div>
          )}

          {/* Create Offer Form Component */}
          <CreateOfferForm
            formData={formData}
            tripRequire={tripRequire}
            todayISO={todayISO}
            maxValidUntilISO={maxValidUntilISO}
            priceOutOfRange={priceOutOfRange}
            validUntilTooEarly={validUntilTooEarly}
            validUntilAfterTripStart={validUntilAfterTripStart}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            submitting={submitting}
          />
        </div>
      </div>

      {/* Confirm Modal Component */}
      <OfferConfirmModal
        show={showConfirm}
        formData={formData}
        tripRequire={tripRequire}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmSubmit}
        submitting={submitting}
      />

      {/* Success Overlay Component */}
      <SuccessOverlay show={showSuccess} />

      <Footer />
    </>
  );
}
