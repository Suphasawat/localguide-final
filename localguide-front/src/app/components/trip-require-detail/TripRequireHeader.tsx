import Link from "next/link";
import { TripRequire } from "@/app/types";

interface TripRequireHeaderProps {
  tripRequire: TripRequire;
  offersCount: number;
  offersLoading: boolean;
  deleteLoading: boolean;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onDelete: () => void;
}

export default function TripRequireHeader({
  tripRequire,
  offersCount,
  offersLoading,
  deleteLoading,
  getStatusColor,
  getStatusText,
  onDelete,
}: TripRequireHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/dashboard" className="hover:text-gray-700">หน้าหลัก</Link>
        <span className="mx-2">/</span>
        <Link href="/user/trip-requires" className="hover:text-gray-700">ความต้องการทริป</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{tripRequire.Title}</span>
      </nav>

      {/* Green Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-emerald-600 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Left */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {tripRequire.Title}
            </h1>

            {/* Chips: เพิ่มคอนทราสต์ */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* สถานะ: พื้นขาว ตัวอักษรโทนสถานะ */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border shadow-sm bg-white ${getStatusColor(
                  tripRequire.Status
                )
                  // map สีของคุณให้เป็น text-* เท่านั้น (bg ถูกกำหนดเป็น white แล้ว)
                  .replace(/bg-[^ ]+/g, "bg-white")
                  .replace(/ring-[^ ]+/g, "")
                  .replace(/text-gray-700/g, "text-gray-800")}`}
              >
                {getStatusText(tripRequire.Status)}
              </span>

              {/* ข้อเสนอ: ขาวใสเล็กน้อย + ขอบชัด */}
              <span className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-white/90 text-emerald-800 border border-emerald-200 shadow-sm">
                📥 ข้อเสนอ {offersLoading ? "…" : offersCount}
              </span>
            </div>

            {/* Quick info: พื้นขาวโปร่ง + ตัวอักษรเข้ม อ่านง่ายขึ้นมาก */}
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-1 bg-white/90 text-emerald-900 px-3 py-1 rounded-full border border-white shadow-sm">
                📍 {tripRequire.Province?.Name || "ไม่ระบุ"}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/90 text-emerald-900 px-3 py-1 rounded-full border border-white shadow-sm">
                📅 {tripRequire.Days} วัน
              </span>
              <span className="inline-flex items-center gap-1 bg-white/90 text-emerald-900 px-3 py-1 rounded-full border border-white shadow-sm">
                💰 {tripRequire.MinPrice.toLocaleString()} - {tripRequire.MaxPrice.toLocaleString()} บาท
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={`/user/trip-requires/${tripRequire.ID}/offers`}
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-medium px-4 py-2 rounded-full hover:bg-emerald-50 shadow-sm transition"
            >
              ดูข้อเสนอ{offersLoading ? "" : ` (${offersCount})`}
            </Link>

            {tripRequire.Status === "open" && (
              <>
                <Link
                  href={`/user/trip-requires/${tripRequire.ID}/edit`}
                  className="inline-flex items-center gap-2 bg-emerald-800 text-white px-4 py-2 rounded-full hover:bg-emerald-900 transition"
                >
                  แก้ไข
                </Link>
                <button
                  onClick={onDelete}
                  disabled={deleteLoading}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {deleteLoading ? "กำลังลบ..." : "ลบ"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
