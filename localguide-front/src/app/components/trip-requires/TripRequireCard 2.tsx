import Link from "next/link";

interface TripRequireCardProps {
  trip: {
    ID: number;
    Title: string;
    Description: string;
    MinPrice: number;
    MaxPrice: number;
    StartDate: string;
    EndDate: string;
    Days: number;
    GroupSize: number;
    Status: string;
    PostedAt: string;
    ExpiresAt?: string;
    total_offers: number;
    province_name: string;
    // ถ้า backend มี field เหล่านี้ ให้ปล่อยไว้ไม่เป็นไร
    BookingID?: number | null;
    AcceptedOfferID?: number | null;
  };
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onDelete: (id: number, title: string) => void;
  deleteLoading: number | null;
}

export default function TripRequireCard({
  trip,
  getStatusColor,
  getStatusText,
  onDelete,
  deleteLoading,
}: TripRequireCardProps) {
  // ✅ ครอบคลุมชื่อสถานะที่เป็นไปได้หลายแบบ
  const normalized = (trip.Status || "").toLowerCase().trim();
  const selectedStatuses = new Set([
    "selected",
    "guide_selected",
    "accepted",
    "booked",
    "booking_created",
    "confirmed",
    "paid",
    "closed", // บางระบบปิดทริปหลังเลือกไกด์
  ]);

  const hasSelectedGuide =
    selectedStatuses.has(normalized) ||
    !!trip.BookingID ||
    !!trip.AcceptedOfferID ||
    getStatusText(trip.Status).includes("เลือกไกด์");

  // ✅ เตรียมปุ่มขวาตามสถานะ
  let rightAction: React.ReactNode = null;

  if (hasSelectedGuide) {
    rightAction = (
      <Link
        href="/trip-bookings"
        className="flex-1 bg-blue-600 text-white text-center py-2.5 px-4 rounded-full hover:bg-blue-700 transition-all font-medium shadow-sm"
      >
        ดูการจองของฉัน
      </Link>
    );
  } else if (trip.total_offers > 0) {
    rightAction = (
      <Link
        href={`/user/trip-requires/${trip.ID}/offers`}
        className="flex-1 bg-blue-600 text-white text-center py-2.5 px-4 rounded-full hover:bg-blue-700 transition-all font-medium shadow-sm"
      >
        ดูข้อเสนอ ({trip.total_offers})
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {trip.Title}
          </h3>
          <span
            className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
              trip.Status
            )}`}
          >
            {getStatusText(trip.Status)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {trip.Description}
        </p>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{trip.province_name || "ไม่ระบุจังหวัด"}</span>
          </div>
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
              {trip.MinPrice.toLocaleString()} -{" "}
              {trip.MaxPrice.toLocaleString()} บาท
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>📆</span>
            <span>
              {new Date(trip.StartDate).toLocaleDateString("th-TH")} -{" "}
              {new Date(trip.EndDate).toLocaleDateString("th-TH")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>📝</span>
            <span>
              โพสต์เมื่อ: {new Date(trip.PostedAt).toLocaleDateString("th-TH")}
            </span>
          </div>
          {trip.ExpiresAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>⏰</span>
              <span>
                หมดอายุ: {new Date(trip.ExpiresAt).toLocaleDateString("th-TH")}
              </span>
            </div>
          )}
          {trip.total_offers > 0 && !hasSelectedGuide && (
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <span>📥</span>
              <span>มีข้อเสนอ {trip.total_offers} รายการ</span>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex gap-2">
            <Link
              href={`/user/trip-requires/${trip.ID}`}
              className="flex-1 bg-emerald-600 text-white text-center py-2.5 px-4 rounded-full hover:bg-emerald-700 transition-all font-medium shadow-sm"
            >
              ดูรายละเอียด
            </Link>

            {/* ✅ ปุ่มขวาเปลี่ยนตามสถานะ */}
            {rightAction}
          </div>

          {normalized === "open" && (
            <div className="flex gap-2">
              <Link
                href={`/user/trip-requires/${trip.ID}/edit`}
                className="flex-1 border border-gray-300 text-gray-700 text-center py-2.5 px-4 rounded-full hover:bg-gray-50 transition-all font-medium"
              >
                แก้ไข
              </Link>
              <button
                type="button"
                onClick={() => onDelete(trip.ID, trip.Title)}
                disabled={deleteLoading !== null}
                className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-full hover:bg-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ลบ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
