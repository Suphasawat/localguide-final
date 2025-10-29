import Link from "next/link";
import { TripRequire } from "@/app/types";

interface OffersHighlightProps {
  tripRequire: TripRequire;
  offersCount: number;
  offersLoading: boolean;
}

export default function OffersHighlight({
  tripRequire,
  offersCount,
  offersLoading,
}: OffersHighlightProps) {
  if (offersLoading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse bg-blue-50 border border-blue-200 rounded-lg p-4 h-16" />
      </div>
    );
  }

  if (offersCount > 0) {
    return (
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="text-blue-800">
            <div className="font-semibold">
              คุณได้รับข้อเสนอแล้ว {offersCount} รายการ
            </div>
            <div className="text-sm">
              เลือกข้อเสนอที่เหมาะสมที่สุดสำหรับทริปของคุณ
            </div>
          </div>
          <Link
            href={`/user/trip-requires/${tripRequire.ID}/offers`}
            className="shrink-0 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            ดูข้อเสนอที่ได้รับ
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  if (tripRequire.Status === "open") {
    return (
      <div className="mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="text-yellow-800">
            <div className="font-semibold">ยังไม่มีข้อเสนอ</div>
            <div className="text-sm">
              ปรับรายละเอียดความต้องการให้ชัดเจนเพื่อดึงดูดไกด์มากขึ้น
            </div>
          </div>
          <Link
            href={`/user/trip-requires/${tripRequire.ID}/edit`}
            className="shrink-0 inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
          >
            แก้ไขความต้องการ
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
