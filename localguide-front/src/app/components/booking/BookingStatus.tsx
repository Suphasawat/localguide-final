"use client";

import { useRouter } from "next/navigation";

interface BookingStatusProps {
  booking: any;
  user: any;
  status: string;
  timeline: {
    steps: Array<{
      key: string;
      label: string;
      state: "complete" | "current" | "upcoming";
    }>;
    terminal?: "cancelled" | "no_show";
  };
  isOwner: boolean;
  isGuideOwner: boolean;
  paying: boolean;
  actionLoading: string | null;
  onPayment: () => void;
  onConfirmGuideArrival: () => void;
  onConfirmTripComplete: () => void;
  onOpenReportNoShow: () => void;
  onConfirmUserNoShow: () => void;
  // 🆕 เพิ่ม callback สำหรับไกด์รายงานลูกค้าไม่มา
  onOpenReportUserNoShow: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPaymentStatus: (booking: any) => string;
  getStartDate: (booking: any) => string;
  getTotal: (booking: any) => number;
  getId: (booking: any) => number;
}

export default function BookingStatus({
  booking,
  user,
  status,
  timeline,
  isOwner,
  isGuideOwner,
  paying,
  actionLoading,
  onPayment,
  onConfirmGuideArrival,
  onConfirmTripComplete,
  onOpenReportNoShow,
  onConfirmUserNoShow,
  onOpenReportUserNoShow,
  getStatusColor,
  getStatusText,
  getPaymentStatus,
  getStartDate,
  getTotal,
  getId,
}: BookingStatusProps) {
  const router = useRouter();

  const toYMD = (raw?: string) => {
    if (!raw) {
      return "-";
    }
    if (raw.length >= 10 && raw[4] === "-" && raw[7] === "-") {
      return raw.slice(0, 10);
    }
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    return raw;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">สถานะการจอง</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">สถานะ</div>
          <div
            className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${getStatusColor(
              status
            )}`}
          >
            {getStatusText(status)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">สถานะการชำระเงิน</div>
          <div className="mt-1 font-medium">
            {getPaymentStatus(booking) || "-"}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">วันที่เริ่ม</div>
          <div className="mt-1">{toYMD(getStartDate(booking))}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">ยอดรวม</div>
          <div className="mt-1 font-semibold">฿{getTotal(booking)}</div>
        </div>
      </div>

      {status === "pending_payment" && isOwner && (
        <button
          onClick={onPayment}
          disabled={paying}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          {paying ? "กำลังสร้างการชำระเงิน..." : "ชำระเงิน"}
        </button>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">ไทม์ไลน์สถานะ</h3>
        <ol className="relative border-s border-gray-200 ms-3">
          {timeline.steps.map((step) => {
            const color =
              step.state === "complete"
                ? "bg-green-600"
                : step.state === "current"
                ? "bg-blue-600"
                : "bg-gray-300";
            const textColor =
              step.state === "upcoming" ? "text-gray-500" : "text-gray-900";
            return (
              <li key={step.key} className="mb-8 ms-6">
                <span
                  className={`absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white ${color}`}
                >
                  {step.state === "complete" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.529-1.652-1.651a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.144-.094l3.474-4.222Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : null}
                </span>
                <div className={`font-medium ${textColor}`}>{step.label}</div>
              </li>
            );
          })}
          {timeline.terminal && (
            <li className="mb-2 ms-6">
              <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white bg-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 text-white"
                >
                  <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-3 9.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" />
                </svg>
              </span>
              <div className="font-medium text-red-700">
                {timeline.terminal === "cancelled" ? "ยกเลิก" : "ลูกค้าไม่มา"}
              </div>
            </li>
          )}
        </ol>
      </div>

      <div className="mt-6 space-x-3">
        {/* ปุ่มสำหรับลูกค้า (User) - แสดงเมื่อเป็น user_id */}
        {isOwner && status === "paid" && (
          <>
            <button
              onClick={onConfirmGuideArrival}
              disabled={actionLoading === "confirm-arrival"}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
            >
              {actionLoading === "confirm-arrival"
                ? "กำลังยืนยัน..."
                : "ยืนยันไกด์มาถึงแล้ว"}
            </button>

            <button
              onClick={onOpenReportNoShow}
              disabled={actionLoading === "report-guide-no-show"}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
            >
              รายงานว่าไกด์ไม่มา
            </button>

            <button
              onClick={onConfirmUserNoShow}
              disabled={actionLoading === "confirm-user-no-show"}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60"
            >
              ยืนยันว่าฉันไม่มา
            </button>
          </>
        )}

        {/* ปุ่มสำหรับไกด์ (Guide) - แสดงเมื่อเป็น guide_id */}
        {isGuideOwner && status === "paid" && (
          <button
            onClick={onOpenReportUserNoShow}
            disabled={actionLoading === "report-user-no-show"}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
          >
            รายงานว่าลูกค้าไม่มา
          </button>
        )}

        {isOwner && status === "trip_started" && (
          <button
            onClick={onConfirmTripComplete}
            disabled={actionLoading === "confirm-complete"}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
          >
            {actionLoading === "confirm-complete"
              ? "กำลังยืนยัน..."
              : "ยืนยันทริปเสร็จสิ้น"}
          </button>
        )}

        {isOwner && status === "trip_completed" && !booking.has_review && (
          <button
            onClick={() => router.push(`/reviews/create/${getId(booking)}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            ⭐ เขียนรีวิว
          </button>
        )}

        {isOwner && status === "trip_completed" && booking.has_review && (
          <div className="inline-flex items-center px-4 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-md">
            ✓ คุณได้เขียนรีวิวแล้ว
          </div>
        )}
      </div>
    </div>
  );
}