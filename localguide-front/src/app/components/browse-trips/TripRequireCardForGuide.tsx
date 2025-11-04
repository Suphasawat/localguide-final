import Link from "next/link";
import { TripRequire } from "./useBrowseTrips";
import {
  formatThaiDate,
  formatBaht,
  getProvinceName,
  getCustomerName,
} from "./tripHelpers";

interface TripRequireCardProps {
  trip: TripRequire;
}

export default function TripRequireCardForGuide({
  trip,
}: TripRequireCardProps) {
  return (
    <article className="group rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {trip.Title || "ไม่ระบุหัวข้อ"}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              trip.Status === "open"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                : "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
            }`}
          >
            {trip.Status || "unknown"}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
          {trip.Description || "—"}
        </p>
      </div>

      <div className="px-5 pt-4 pb-5 text-sm text-gray-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{getProvinceName(trip)}</span>
          </div>
          {trip.user_name && (
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span>{getCustomerName(trip)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>{trip.GroupSize} คน</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{trip.Days} วัน</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💰</span>
            <span>
              {formatBaht(trip.MinPrice)} - {formatBaht(trip.MaxPrice)} บาท
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🗓️</span>
            <span>
              {formatThaiDate(trip.StartDate)} - {formatThaiDate(trip.EndDate)}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <Link
            href={`/guide/trip-offers/create?trip_require_id=${trip.ID}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition"
          >
            เสนอแพ็กเกจ
          </Link>
        </div>
      </div>
    </article>
  );
}
