"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Loading from "@/app/components/Loading";
import { useAuth } from "../../../contexts/AuthContext";
import { provinceAPI, tripRequireAPI } from "../../../lib/api";
import { Province, CreateTripRequireData } from "../../../types";

export default function CreateTripRequirePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

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

  // auth แล้วค่อยโหลดจังหวัด
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

  // เช็ก yyyy-mm-dd แบบไม่ใช้ regex
  function isISODate(value: string): boolean {
    if (value.length !== 10) {
      return false;
    }
    if (value[4] !== "-" || value[7] !== "-") {
      return false;
    }
    const y = Number(value.slice(0, 4));
    const m = Number(value.slice(5, 7));
    const d = Number(value.slice(8, 10));
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
      return false;
    }
    if (m < 1 || m > 12) {
      return false;
    }
    const dim = new Date(y, m, 0).getDate();
    return d >= 1 && d <= dim;
  }

  function toLocalDate(y: number, m: number, d: number): Date {
    return new Date(y, m - 1, d);
  }

  // แปลงเป็น dd/mm/yyyy สำหรับ backend
  function toBackendDate(iso: string): string {
    if (!isISODate(iso)) {
      return iso;
    }
    const y = iso.slice(0, 4);
    const m = iso.slice(5, 7);
    const d = iso.slice(8, 10);
    return `${d}/${m}/${y}`;
  }

  // คำนวณจำนวนวันเมื่อเลือกช่วงวันที่ (deps คงที่ 2 ตัว)
  useEffect(() => {
    const s = formData.start_date;
    const e = formData.end_date;
    if (!isISODate(s) || !isISODate(e)) {
      return;
    }

    const sy = Number(s.slice(0, 4));
    const sm = Number(s.slice(5, 7));
    const sd = Number(s.slice(8, 10));
    const ey = Number(e.slice(0, 4));
    const em = Number(e.slice(5, 7));
    const ed = Number(e.slice(8, 10));

    const start = toLocalDate(sy, sm, sd);
    const end = toLocalDate(ey, em, ed);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return;
    }

    const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    setFormData((prev) => (prev.days === days ? prev : { ...prev, days }));
  }, [formData.start_date, formData.end_date]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    // ตัด "days" ออก ไม่ให้ผู้ใช้แก้ไขค่า days ผ่าน input
    const numeric = new Set([
      "province_id",
      "min_price",
      "max_price",
      "group_size",
      "min_rating",
    ]);

    setFormData((prev) => ({
      ...prev,
      [name]: numeric.has(name) ? Number(value) : value,
    }));
  }

  const isPriceInvalid =
    formData.min_price > 0 &&
    formData.max_price > 0 &&
    formData.min_price >= formData.max_price;

  const isDateRangeInvalid = (() => {
    const s = formData.start_date;
    const e = formData.end_date;
    if (!isISODate(s) || !isISODate(e)) {
      return false;
    }
    const start = toLocalDate(Number(s.slice(0, 4)), Number(s.slice(5, 7)), Number(s.slice(8, 10)));
    const end = toLocalDate(Number(e.slice(0, 4)), Number(e.slice(5, 7)), Number(e.slice(8, 10)));
    return Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start;
  })();

  // วันหมดอายุต้องไม่ช้ากว่าวันเริ่มต้นทริป
  const isExpireAfterStart = (() => {
    const expireISO = formData.expires_at;
    const startISO = formData.start_date;
    if (!expireISO || !isISODate(expireISO) || !isISODate(startISO)) {
      return false;
    }
    const ex = toLocalDate(
      Number(expireISO.slice(0, 4)),
      Number(expireISO.slice(5, 7)),
      Number(expireISO.slice(8, 10))
    );
    const st = toLocalDate(
      Number(startISO.slice(0, 4)),
      Number(startISO.slice(5, 7)),
      Number(startISO.slice(8, 10))
    );
    return ex.getTime() > st.getTime();
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) {
      return;
    }

    setError("");

    if (!formData.title || !formData.description || !formData.start_date || !formData.end_date) {
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
        router.push("/user/trip-requires");
      } else {
        setError("ไม่สามารถสร้างความต้องการได้");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "เกิดข้อผิดพลาดในการสร้างความต้องการ"
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loadingProvinces) {
    return <Loading text="กำลังโหลดแบบฟอร์ม..." />;
  }

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100dvh-150px)] bg-gray-100 px-4 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="overflow-hidden rounded-[24px] border border-gray-300 bg-white shadow-sm">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-300">
              <h1 className="text-3xl font-extrabold text-blue-900">สร้างความต้องการเที่ยวใหม่</h1>
              <Link
                href="/dashboard"
                className="rounded-full border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
              >
                ← กลับไป Dashboard
              </Link>
            </div>

            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-7">
                {error && (
                  <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <p className="mb-2 text-sm font-extrabold text-blue-800">หัวข้อ *</p>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600"
                    placeholder="เช่น หาไกด์เที่ยวแม่ฮ่องสอน 3 วัน 2 คืน"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-extrabold text-blue-800">รายละเอียด *</p>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    className="w-full rounded-2xl border-2 border-gray-300 px-5 py-4 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600"
                    placeholder="อธิบายรายละเอียดการเที่ยวที่ต้องการ"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-extrabold text-blue-800">จังหวัด *</p>
                  <select
                    name="province_id"
                    required
                    className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
                    value={formData.province_id}
                    onChange={handleChange}
                  >
                    <option value={0}>เลือกจังหวัด</option>
                    {provinces.map((p) => (
                      <option key={p.ID} value={p.ID}>
                        {p.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="mb-2 text-sm font-extrabold text-blue-800">ราคาต่ำสุด (บาท) *</p>
                    <input
                      type="number"
                      name="min_price"
                      required
                      min={0}
                      step={100}
                      className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
                      value={formData.min_price}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-extrabold text-blue-800">ราคาสูงสุด (บาท) *</p>
                    <input
                      type="number"
                      name="max_price"
                      required
                      min={0}
                      step={100}
                      className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
                      value={formData.max_price}
                      onChange={handleChange}
                    />
                    {isPriceInvalid && (
                      <p className="mt-1 text-xs text-red-600">ราคาสูงสุดต้องมากกว่าราคาต่ำสุด</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="mb-2 text-sm font-extrabold text-blue-800">วันเริ่มต้น *</p>
                    <input
                      type="date"
                      name="start_date"
                      required
                      className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-extrabold text-blue-800">วันสิ้นสุด *</p>
                    <input
                      type="date"
                      name="end_date"
                      required
                      min={formData.start_date || undefined}
                      className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                    {isDateRangeInvalid && (
                      <p className="mt-1 text-xs text-red-600">วันสิ้นสุดต้องไม่เร็วกว่าวันเริ่มต้น</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="mb-2 text-sm font-extrabold text-blue-800">จำนวนวัน *</p>
                    <input
                      type="number"
                      name="days"
                      readOnly
                      aria-readonly="true"
                      min={1}
                      className="w-full h-12 rounded-full border-2 border-gray-200 bg-gray-100 px-5 text-[15px] text-gray-700 cursor-not-allowed focus:outline-none"
                      value={formData.days}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      ระบบคำนวณอัตโนมัติจากช่วงวันที่ (แก้ไขไม่ได้)
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-extrabold text-blue-800">จำนวนคน *</p>
                    <input
                      type="number"
                      name="group_size"
                      required
                      min={1}
                      className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
                      value={formData.group_size}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-extrabold text-blue-800">คะแนนไกด์ขั้นต่ำ</p>
                  <select
                    name="min_rating"
                    className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
                    value={formData.min_rating}
                    onChange={handleChange}
                  >
                    <option value={0}>ไม่กำหนด</option>
                    <option value={3}>3 ดาวขึ้นไป</option>
                    <option value={4}>4 ดาวขึ้นไป</option>
                    <option value={4.5}>4.5 ดาวขึ้นไป</option>
                  </select>
                </div>

                <div>
                  <p className="mb-2 text-sm font-extrabold text-blue-800">ความต้องการพิเศษ</p>
                  <textarea
                    name="requirements"
                    rows={3}
                    className="w-full rounded-2xl border-2 border-gray-300 px-5 py-4 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600"
                    placeholder="เช่น ต้องการไกด์พูดภาษาอังกฤษได้, มีรถรับส่ง"
                    value={formData.requirements}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-extrabold text-blue-800">วันหมดอายุโพสต์</p>
                  <input
                    type="date"
                    name="expires_at"
                    max={formData.start_date || undefined}
                    className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
                    value={formData.expires_at}
                    onChange={handleChange}
                  />
                  {isExpireAfterStart && (
                    <p className="mt-1 text-xs text-red-600">
                      วันหมดอายุโพสต์ต้องไม่ช้ากว่าวันเริ่มต้นทริป
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      isPriceInvalid ||
                      isDateRangeInvalid ||
                      isExpireAfterStart ||
                      !formData.title ||
                      !formData.description ||
                      !formData.province_id
                    }
                    className="flex-1 rounded-full bg-blue-700 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
                  >
                    {loading ? "กำลังสร้าง..." : "สร้างความต้องการ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-full border-2 border-gray-300 px-6 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-50 transition"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/dashboard" className="text-sm font-semibold text-blue-700 hover:underline">
              ← กลับไป Dashboard
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
