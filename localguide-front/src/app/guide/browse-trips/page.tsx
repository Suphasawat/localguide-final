"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tripRequireAPI } from "../../lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// ---------- Types ----------
interface Province {
  ID: number;
  Name: string;
}
interface TripRequire {
  ID: number;
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string; // ISO
  EndDate: string;   // ISO
  Days: number;
  GroupSize: number;
  Status: string;
  // optional (บาง backend อาจส่งมา)
  province_name?: string;
  user_name?: string;
  Province?: Province;
}
interface BrowseResponse {
  tripRequires?: TripRequire[];
  trip_requires?: TripRequire[]; // เผื่อบางที่ใช้ snake_case
}

// ---------- Helpers ----------
function thDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}
function baht(n: number) {
  return n.toLocaleString("th-TH");
}
function provinceText(t: TripRequire) {
  return t.province_name || t.Province?.Name || "ไม่ระบุจังหวัด";
}
function customerText(t: TripRequire) {
  return t.user_name && t.user_name.trim().length > 0 ? t.user_name : "ผู้ใช้ไม่ระบุชื่อ";
}

// ---------- Page ----------
export default function BrowseTripsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<TripRequire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth gate (เฉพาะไกด์)
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    if (user?.role !== 2) {
      router.replace("/dashboard");
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await tripRequireAPI.browse(); // GET /api/browse/trip-requires
      const body: BrowseResponse | TripRequire[] = res?.data;
      const list =
        (Array.isArray(body) ? body : body?.tripRequires ?? body?.trip_requires) ?? [];
      setItems(list);
    } catch (_e) {
      setError("ไม่สามารถโหลดข้อมูลได้");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] grid place-items-center bg-emerald-50">
          <div className="animate-pulse text-emerald-700 font-semibold">กำลังโหลด...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* HERO: เขียวสดใส */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-emerald-50/90 text-xs uppercase tracking-wider">สำหรับไกด์</p>
                <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">
                  ความต้องการทริป
                </h1>
                <p className="mt-2 text-emerald-50">
                  ดูความต้องการเที่ยวจากลูกค้าและเสนอแพ็กเกจของคุณ
                </p>
              </div>
              <button
                type="button"
                onClick={load}
                className="self-start md:self-auto rounded-full bg-white/90 hover:bg-white text-emerald-700 px-5 py-2 text-sm font-semibold shadow-sm transition"
              >
                รีเฟรชรายการ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="min-h-[60vh] bg-emerald-50/30 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="grid place-items-center py-16">
              <div className="text-center">
                <div className="text-6xl mb-2">🗺️</div>
                <p className="text-gray-600">ยังไม่มีความต้องการทริปในขณะนี้</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => (
                <article
                  key={t.ID}
                  className="group rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-5 pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {t.Title || "ไม่ระบุหัวข้อ"}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          t.Status === "open"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
                        }`}
                      >
                        {t.Status || "unknown"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                      {t.Description || "—"}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="px-5 pt-4 pb-5 text-sm text-gray-700">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{provinceText(t)}</span>
                      </div>
                      {/* แสดงชื่อผู้ใช้ถ้า backend ส่งมา (ไม่ใช้ any) */}
                      {t.user_name && (
                        <div className="flex items-center gap-2">
                          <span>👤</span>
                          <span>{customerText(t)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>{t.GroupSize} คน</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{t.Days} วัน</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span>
                          {baht(t.MinPrice)} - {baht(t.MaxPrice)} บาท
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🗓️</span>
                        <span>
                          {thDate(t.StartDate)} - {thDate(t.EndDate)}
                        </span>
                      </div>
                    </div>

                    {/* Actions – เหลือเฉพาะ “เสนอแพ็กเกจ” */}
                    <div className="mt-5">
                      <Link
                        href={`/guide/trip-offers/create?trip_require_id=${t.ID}`}
                        className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition"
                      >
                        เสนอแพ็กเกจ
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
