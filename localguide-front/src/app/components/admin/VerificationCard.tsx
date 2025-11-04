"use client";
import { useState } from "react";
import { GuideVerification } from "../../types/index";

interface VerificationCardProps {
  verification: GuideVerification;
  onApprove: (id: number, status: "approved" | "rejected") => void;
}

export default function VerificationCard({
  verification,
  onApprove,
}: VerificationCardProps) {
  const [submitting, setSubmitting] = useState<null | "approved" | "rejected">(null);

  function getStatusClass(status: string) {
    if (status === "pending") {
      return "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200";
    } else if (status === "approved") {
      return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
    } else {
      return "bg-red-100 text-red-800 ring-1 ring-red-200";
    }
  }

  function handleClick(next: "approved" | "rejected") {
    const confirmText = next === "approved" ? "อนุมัติ" : "ปฏิเสธ";
    if (!window.confirm(`ยืนยันการ${confirmText}คำขอนี้ใช่ไหม?`)) return;
    setSubmitting(next);
    onApprove(verification.ID, next);
  }

  const displayName = `${verification.User?.FirstName ?? ""} ${verification.User?.LastName ?? ""}`.trim();
  const email = verification.User?.Email || "";
  const provinceName = verification.Province?.Name ?? "-";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar ตัวอักษรย่อ */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 font-semibold text-lg">
            {displayName ? displayName.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {displayName || "ไม่พบชื่อผู้ใช้"}
            </h3>
            {email && <p className="text-sm text-gray-600">{email}</p>}
          </div>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
            verification.Status
          )}`}
        >
          {verification.Status}
        </span>
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-gray-100" />

      {/* Fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            จังหวัด
          </p>
          <p className="mt-1 text-gray-900">{provinceName}</p>
        </div>

        {/* ❌ ลบช่อง “สถานะคำขอ” ออก */}
      </div>

      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          แนะนำตัว (Bio)
        </p>
        <p className="mt-2 whitespace-pre-wrap text-gray-900">
          {verification.Bio || "-"}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          รายละเอียดการให้บริการ
        </p>
        <p className="mt-2 whitespace-pre-wrap text-gray-900">
          {verification.Description || "-"}
        </p>
      </div>

      {/* Actions */}
      {verification.Status === "pending" && (
        <>
          <div className="my-5 h-px bg-gray-100" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleClick("approved")}
              disabled={submitting !== null}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
            >
              {submitting === "approved" ? "กำลังอนุมัติ..." : "อนุมัติ"}
            </button>
            <button
              type="button"
              onClick={() => handleClick("rejected")}
              disabled={submitting !== null}
              className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-white font-semibold hover:bg-red-700 disabled:opacity-60 sm:w-auto"
            >
              {submitting === "rejected" ? "กำลังปฏิเสธ..." : "ปฏิเสธ"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
