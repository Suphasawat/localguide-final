"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import { provinceAPI, tripRequireAPI } from "../../../../lib/api";
import { Province, CreateTripRequireData } from "../../../../types";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export default function EditTripRequirePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loading, setLoading] = useState(false);
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
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    loadProvinces();
    if (id) loadExisting(Number(id));
  }, [isAuthenticated, authLoading, id, router]);

  async function loadProvinces() {
    try {
      const res = await provinceAPI.getAll();
      setProvinces(res.data.provinces || []);
    } catch {
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  }

  function toInputDate(val: unknown): string {
    if (!val) return "";
    if (typeof val === "string" && val.includes("/")) {
      const [dd, mm, yyyy] = val.split("/");
      if (dd && mm && yyyy) {
        return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
      }
    }
    const d = new Date(val as any);
    if (!Number.isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  }

  async function loadExisting(idNum: number) {
    try {
      const res = await tripRequireAPI.getById(idNum);
      const tr = res.data?.data || res.data?.tripRequire || res.data;
      if (!tr) return;

      setFormData({
        province_id: tr.ProvinceID || tr.province_id || 0,
        title: tr.Title || tr.title || "",
        description: tr.Description || tr.description || "",
        min_price: tr.MinPrice || tr.min_price || 0,
        max_price: tr.MaxPrice || tr.max_price || 0,
        start_date: toInputDate(tr.StartDate || tr.start_date || tr.startDate),
        end_date: toInputDate(tr.EndDate || tr.end_date || tr.endDate),
        days: tr.Days || tr.days || 1,
        min_rating: tr.MinRating || tr.min_rating || 0,
        group_size: tr.GroupSize || tr.group_size || 1,
        requirements: tr.Requirements || tr.requirements || "",
        expires_at: toInputDate(tr.ExpiresAt || tr.expires_at || tr.expiresAt),
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.error || err?.message || "ไม่พบข้อมูลการโพสต์"
      );
    }
  }

  function isISODate(str: string): boolean {
    if (str.length !== 10) return false;
    if (str[4] !== "-" || str[7] !== "-") return false;
    const y = Number(str.slice(0, 4));
    const m = Number(str.slice(5, 7));
    const d = Number(str.slice(8, 10));
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return false;
    if (m < 1 || m > 12) return false;
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d < 1 || d > daysInMonth) return false;
    return true;
  }

  function toBackendDate(s: string): string {
    if (!isISODate(s)) return s;
    const y = s.slice(0, 4);
    const m = s.slice(5, 7);
    const d = s.slice(8, 10);
    return `${d}/${m}/${y}`;
  }

  // คำนวณจำนวนวันเมื่อเลือกช่วงวันที่ครบ
  useEffect(() => {
    const s = formData.start_date;
    const e = formData.end_date;
    if (isISODate(s) && isISODate(e)) {
      const start = new Date(s);
      const end = new Date(e);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start) {
        const diff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
        if (diff !== formData.days) {
          setFormData(prev => ({ ...prev, days: diff }));
        }
      }
    }
  }, [formData.start_date, formData.end_date, formData.days]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    const numericKeys = ["province_id", "min_price", "max_price", "days", "group_size", "min_rating"];
    setFormData(prev => ({
      ...prev,
      [name]: numericKeys.includes(name) ? Number(value) : value,
    }));
  }

  const isPriceInvalid =
    formData.min_price > 0 &&
    formData.max_price > 0 &&
    formData.min_price >= formData.max_price;

  const isDateRangeInvalid = (() => {
    const s = formData.start_date;
    const e = formData.end_date;
    if (!isISODate(s) || !isISODate(e)) return false;
    const sd = new Date(s);
    const ed = new Date(e);
    return Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime()) || ed < sd;
  })();

  // วันหมดอายุโพสต์ ต้องไม่ช้ากว่าวันเริ่มต้น
  const isExpireInvalid = (() => {
    const exp = formData.expires_at;
    const s = formData.start_date;
    if (!exp) return false;                   // ไม่กรอก = ไม่ถือว่าผิด
    if (!isISODate(exp) || !isISODate(s)) return false; // ให้กรอกให้ครบก่อน
    const exd = new Date(exp);
    const sd = new Date(s);
    return Number.isNaN(exd.getTime()) || Number.isNaN(sd.getTime()) || exd > sd;
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

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
    if (isExpireInvalid) {
      setError("วันหมดอายุโพสต์ต้องไม่ช้ากว่าวันเริ่มต้น");
      return;
    }

    const payload = {
      province_id: formData.province_id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      min_price: formData.min_price,
      max_price: formData.max_price,
      start_date: toBackendDate(formData.start_date),
      end_date: toBackendDate(formData.end_date),
      days: formData.days,
      min_rating: formData.min_rating,
      group_size: formData.group_size,
      requirements: formData.requirements.trim(),
      expires_at: formData.expires_at ? toBackendDate(formData.expires_at) : "",
    };

    setLoading(true);
    try {
      if (!id) throw new Error("Missing id");
      const res = await tripRequireAPI.update(Number(id), payload);
      if (res.data) {
        router.push("/user/trip-requires");
      } else {
        setError("ไม่สามารถแก้ไขความต้องการได้");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "เกิดข้อผิดพลาดในการแก้ไขความต้องการ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loadingProvinces) return <Loading text="กำลังโหลดแบบฟอร์ม..." />;

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100dvh-150px)] bg-gray-100 px-4 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="overflow-hidden rounded-[24px] border border-gray-300 bg-white shadow-sm">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-300">
              <h1 className="text-3xl font-extrabold text-blue-900">แก้ไขโพสต์ความต้องการเที่ยว</h1>
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
                    placeholder="อธิบายรายละเอียดการเที่ยวที่คุณต้องการ"
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
                      required
                      min={1}
                      className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
                      value={formData.days}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">ระบบจะคำนวณอัตโนมัติจากช่วงวันที่</p>
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
                    className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text=[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
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
                    className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-blue-600"
                    value={formData.expires_at}
                    onChange={handleChange}
                    max={formData.start_date || undefined}
                  />
                  {isExpireInvalid && (
                    <p className="mt-1 text-xs text-red-600">
                      วันหมดอายุโพสต์ต้องไม่ช้ากว่าวันเริ่มต้น
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
                      isExpireInvalid ||
                      !formData.title ||
                      !formData.description ||
                      !formData.province_id
                    }
                    className="flex-1 rounded-full bg-blue-700 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
                  >
                    {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
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
            <Link
              href="/user/trip-requires"
              className="text-sm font-semibold text-blue-700 hover:underline"
            >
              ← ดูโพสต์ของฉัน
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
