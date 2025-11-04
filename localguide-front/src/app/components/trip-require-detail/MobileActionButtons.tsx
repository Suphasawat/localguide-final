import Link from "next/link";
import { TripRequire } from "@/app/types";

interface MobileActionButtonsProps {
  tripRequire: TripRequire;
  offersCount: number;
  offersLoading: boolean;
  deleteLoading: boolean;
  onDelete: () => void;
}

export default function MobileActionButtons({
  tripRequire,
  offersCount,
  offersLoading,
  deleteLoading,
  onDelete,
}: MobileActionButtonsProps) {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2">
      <div className="flex gap-2">
        <Link
          href={`/user/trip-requires/${tripRequire.ID}/offers`}
          className="flex-1 bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
        >
          ดูข้อเสนอ{offersLoading ? "" : ` (${offersCount})`}
        </Link>
        {tripRequire.Status === "open" && (
          <Link
            href={`/user/trip-requires/${tripRequire.ID}/edit`}
            className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            แก้ไข
          </Link>
        )}
      </div>
      {tripRequire.Status === "open" && (
        <button
          onClick={onDelete}
          disabled={deleteLoading}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleteLoading ? "กำลังลบ..." : "ลบความต้องการ"}
        </button>
      )}
    </div>
  );
}
