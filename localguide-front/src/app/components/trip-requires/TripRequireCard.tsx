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
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {trip.Title}
          </h3>
          <span
            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${getStatusColor(
              trip.Status
            )}`}
          >
            {getStatusText(trip.Status)}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3">{trip.Description}</p>

        <div className="space-y-2 text-sm text-gray-500">
          <div>📍 {trip.province_name || "ไม่ระบุจังหวัด"}</div>
          <div>👥 {trip.GroupSize} คน</div>
          <div>📅 {trip.Days} วัน</div>
          <div>
            💰 {trip.MinPrice.toLocaleString()} -{" "}
            {trip.MaxPrice.toLocaleString()} บาท
          </div>
          <div>
            📆 {new Date(trip.StartDate).toLocaleDateString("th-TH")} -{" "}
            {new Date(trip.EndDate).toLocaleDateString("th-TH")}
          </div>
          <div>
            📝 โพสต์เมื่อ: {new Date(trip.PostedAt).toLocaleDateString("th-TH")}
          </div>
          {trip.ExpiresAt && (
            <div>
              ⏰ หมดอายุ: {new Date(trip.ExpiresAt).toLocaleDateString("th-TH")}
            </div>
          )}
          {trip.total_offers > 0 && (
            <div className="text-blue-600 font-medium">
              📥 มีข้อเสนอ {trip.total_offers} รายการ
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex space-x-2">
            <Link
              href={`/user/trip-requires/${trip.ID}`}
              className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              ดูรายละเอียด
            </Link>

            {trip.total_offers > 0 && (
              <Link
                href={`/user/trip-requires/${trip.ID}/offers`}
                className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                ดูข้อเสนอ ({trip.total_offers})
              </Link>
            )}
          </div>

          {trip.Status === "open" && (
            <div className="flex space-x-2">
              <Link
                href={`/user/trip-requires/${trip.ID}/edit`}
                className="flex-1 bg-gray-600 text-white text-center py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                แก้ไข
              </Link>
              <button
                type="button"
                onClick={() => onDelete(trip.ID, trip.Title)}
                disabled={deleteLoading !== null}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
