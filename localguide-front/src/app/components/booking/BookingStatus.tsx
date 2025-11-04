"use client";

import { useRouter } from "next/navigation";
import React from "react";

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
  onOpenReportUserNoShow: () => void;
  onOpenDispute: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPaymentStatus: (booking: any) => string;
  getStartDate: (booking: any) => string;
  getTotal: (booking: any) => number;
  getId: (booking: any) => number;
}

export default function BookingStatus(props: BookingStatusProps) {
  const {
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
    onOpenDispute,
    getStatusColor,
    getStatusText,
    getPaymentStatus,
    getStartDate,
    getTotal,
    getId,
  } = props;

  const router = useRouter();

  function toYMD(raw?: string): string {
    if (!raw) return "-";
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
  }

  function formatTHB(n: number): string {
    if (typeof n !== "number") return "-";
    try {
      return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `฿${n}`;
    }
  }

  // ---------- NEW: โต้แย้ง/รอแอดมิน ----------
  const s = (status || "").toLowerCase();
  const isDispute = s.includes("dispute") || s.includes("admin_review");
  const adminReviewMessage = isDispute
    ? "โต้แย้งการรีพอร์ตเรียบร้อยแล้ว Admin จะพิจารณาภายใน 24-48 ชั่วโมง"
    : null;

  // ---------- NEW: terminal label ที่ถูกต้อง ----------
  function getTerminalLabel(): string {
    if (s.includes("guide_no_show")) return "ไกด์ไม่มา";
    if (s.includes("user_no_show")) return "ลูกค้าไม่มา";
    if (s.includes("cancel")) return "ยกเลิก";
    if (timeline?.terminal === "cancelled") return "ยกเลิก";
    if (timeline?.terminal === "no_show") return "ลูกค้าไม่มา";
    return "";
  }

  // แสดง terminal เฉพาะเมื่อไม่อยู่ระหว่างโต้แย้ง/รอแอดมิน
  const shouldShowTerminal =
    !isDispute &&
    (Boolean(timeline?.terminal) || s.includes("no_show") || s.includes("cancel"));

  // ===== ปุ่ม action แยกตามสถานะ =====
  let ownerPendingPaymentButton: React.ReactNode = null;
  if (isOwner && status === "pending_payment") {
    ownerPendingPaymentButton = (
      <button
        onClick={onPayment}
        disabled={paying}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
      >
        {paying ? "กำลังสร้างการชำระเงิน..." : "ชำระเงิน"}
      </button>
    );
  }

  let ownerPaidButtons: React.ReactNode = null;
  if (isOwner && status === "paid") {
    ownerPaidButtons = (
      <div className="inline-flex gap-3 flex-wrap">
        <button
          onClick={onConfirmGuideArrival}
          disabled={actionLoading === "confirm-arrival"}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
        >
          {actionLoading === "confirm-arrival" ? "กำลังยืนยัน..." : "ยืนยันไกด์มาถึงแล้ว"}
        </button>
        <button
          onClick={onOpenReportNoShow}
          disabled={actionLoading === "report-guide-no-show"}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
        >
          รายงานว่าไกด์ไม่มา
        </button>
      </div>
    );
  }

  let ownerDisputeButtons: React.ReactNode = null;
  if (isOwner && status === "user_no_show_reported") {
    ownerDisputeButtons = (
      <div className="inline-flex gap-3 flex-wrap">
        <button
          onClick={onConfirmUserNoShow}
          disabled={actionLoading === "confirm-user-no-show"}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60"
        >
          ยืนยันว่าฉันไม่มา
        </button>
        <button
          onClick={() => {
            if (actionLoading) return;
            onOpenDispute();
          }}
          disabled={actionLoading === "dispute-no-show"}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
        >
          โต้แย้งการรีพอร์ต
        </button>
      </div>
    );
  }

  let guidePaidButtons: React.ReactNode = null;
  if (isGuideOwner && status === "paid") {
    guidePaidButtons = (
      <button
        onClick={onOpenReportUserNoShow}
        disabled={actionLoading === "report-user-no-show"}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
      >
        รายงานว่าลูกค้าไม่มา
      </button>
    );
  }

  let ownerTripStartedButtons: React.ReactNode = null;
  if (isOwner && status === "trip_started") {
    ownerTripStartedButtons = (
      <button
        onClick={onConfirmTripComplete}
        disabled={actionLoading === "confirm-complete"}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
      >
        {actionLoading === "confirm-complete" ? "กำลังยืนยัน..." : "ยืนยันทริปเสร็จสิ้น"}
      </button>
    );
  }

  let ownerReviewButtons: React.ReactNode = null;
  if (isOwner && status === "trip_completed") {
    if (!booking?.has_review) {
      ownerReviewButtons = (
        <button
          onClick={() => router.push(`/reviews/create/${getId(booking)}`)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
        >
          ⭐ เขียนรีวิว
        </button>
      );
    } else {
      ownerReviewButtons = (
        <div className="inline-flex items-center px-4 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-md">
          ✓ คุณได้เขียนรีวิวแล้ว
        </div>
      );
    }
  }

  // classes for status pill
  let statusPillClass = "inline-block mt-1 px-3 py-1 rounded-full text-sm ";
  statusPillClass += getStatusColor(status);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* NEW: แบนเนอร์แจ้งโต้แย้ง */}
      {adminReviewMessage && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-800 text-sm">
          {adminReviewMessage}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">สถานะการจอง</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">สถานะ</div>
          <div className={statusPillClass}>{getStatusText(status)}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">สถานะการชำระเงิน</div>
          <div className="mt-1 font-medium">{getPaymentStatus(booking) || "-"}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">วันที่เริ่ม</div>
          <div className="mt-1">{toYMD(getStartDate(booking))}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">ยอดรวม</div>
          <div className="mt-1 font-semibold">{formatTHB(getTotal(booking))}</div>
        </div>
      </div>

      {ownerPendingPaymentButton}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">ไทม์ไลน์สถานะ</h3>
        <ol className="relative border-s border-gray-200 ms-3">
          {timeline?.steps?.map((step) => {
            let dotColor = "bg-gray-300";
            let textColor = "text-gray-900";
            if (step.state === "complete") {
              dotColor = "bg-green-600";
            } else if (step.state === "current") {
              dotColor = "bg-blue-600";
            } else {
              textColor = "text-gray-500";
            }

            return (
              <li key={step.key} className="mb-8 ms-6">
                <span className={`absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white ${dotColor}`}>
                  {step.state === "complete" && (
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
                  )}
                </span>
                <div className={`font-medium ${textColor}`}>{step.label}</div>
              </li>
            );
          })}

          {shouldShowTerminal && (
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
              <div className="font-medium text-red-700">{getTerminalLabel()}</div>
            </li>
          )}
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {ownerPaidButtons}
        {ownerDisputeButtons}
        {guidePaidButtons}
        {ownerTripStartedButtons}
        {ownerReviewButtons}
      </div>
    </div>
  );
}
