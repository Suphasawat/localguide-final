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
    <div className="mb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/dashboard" className="hover:text-gray-700">
          หน้าหลัก
        </Link>
        <svg
          className="w-4 h-4 mx-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <Link href="/user/trip-requires" className="hover:text-gray-700">
          ความต้องการทริป
        </Link>
        <svg
          className="w-4 h-4 mx-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-gray-900">{tripRequire.Title}</span>
      </nav>

      <div className="flex items-center mb-4">
        <Link
          href="/user/trip-requires"
          className="text-blue-600 hover:text-blue-700 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          กลับ
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {tripRequire.Title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                tripRequire.Status
              )}`}
            >
              {getStatusText(tripRequire.Status)}
            </span>
            <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              📥 ข้อเสนอ {offersLoading ? "…" : offersCount}
            </span>
          </div>

          {/* Quick chips */}
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
              📍 {tripRequire.Province?.Name || "ไม่ระบุ"}
            </span>
            <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
              📅 {tripRequire.Days} วัน
            </span>
            <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
              💰 {tripRequire.MinPrice.toLocaleString()} -{" "}
              {tripRequire.MaxPrice.toLocaleString()} บาท
            </span>
          </div>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href={`/user/trip-requires/${tripRequire.ID}/offers`}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            ดูข้อเสนอ{offersLoading ? "" : ` (${offersCount})`}
          </Link>
          {tripRequire.Status === "open" && (
            <>
              <Link
                href={`/user/trip-requires/${tripRequire.ID}/edit`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                แก้ไข
              </Link>
              <button
                onClick={onDelete}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "กำลังลบ..." : "ลบ"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
