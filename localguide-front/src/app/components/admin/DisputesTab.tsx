"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface DisputeReport {
  ID: number;
  TripBookingID: number;
  ReporterID: number;
  ReportedUserID: number;
  ReportType: string;
  Title: string;
  Description: string;
  Evidence: string;
  Status: string;
  CreatedAt: string;
  ResolvedAt?: string;
  AdminNotes?: string;
  OriginalReport?: {
    ID: number;
    Title: string;
    Description?: string;
    Evidence?: string;
    CreatedAt?: string;
  } | null;
  TripBooking?: {
    ID: number;
    StartDate: string;
    TotalAmount: number;
    Status?: string;
    CancellationReason?: string; // จะเก็บผลการตัดสิน เช่น "guide_wins", "user_wins", "split_cost"
    User?: {
      FirstName: string;
      LastName: string;
      Email: string;
      Avatar?: string;
    };
    Guide?: {
      User?: {
        FirstName: string;
        LastName: string;
        Email: string;
        Avatar?: string;
      };
    };
  };
}

interface DisputesTabProps {
  disputes: DisputeReport[];
  onResolve: (bookingId: number, decision: string, reason: string) => Promise<void>;
}

export default function DisputesTab({ disputes, onResolve }: DisputesTabProps) {
  const [selectedDispute, setSelectedDispute] = useState<DisputeReport | null>(null);
  const [decision, setDecision] = useState<"guide_wins" | "user_wins" | "split_cost">(
    "guide_wins"
  );
  const [adminNotes, setAdminNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const [historyTab, setHistoryTab] = useState<"pending" | "resolved">("pending");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8080";

  // แยกข้อพิพาทที่รอตัดสิน vs ตัดสินแล้ว
  const { pendingDisputes, resolvedDisputes } = useMemo(() => {
    const pending: DisputeReport[] = [];
    const resolved: DisputeReport[] = [];

    for (const d of disputes || []) {
      const hasResolvedAt = !!d.ResolvedAt;
      const hasCancelReason = !!d.TripBooking?.CancellationReason;
      if (hasResolvedAt || hasCancelReason) {
        resolved.push(d);
      } else {
        pending.push(d);
      }
    }

    return { pendingDisputes: pending, resolvedDisputes: resolved };
  }, [disputes]);

  function getDecisionLabel(cancellationReason?: string) {
    if (!cancellationReason) {
      return "ไม่ทราบผลการตัดสิน";
    }
    if (cancellationReason.includes("guide_wins")) {
      return "ไกด์ชนะ";
    }
    if (cancellationReason.includes("user_wins")) {
      return "ลูกค้าชนะ";
    }
    if (cancellationReason.includes("split_cost")) {
      return "แบ่งค่าเสียหาย";
    }
    return cancellationReason;
  }

  function getDecisionColor(cancellationReason?: string) {
    if (!cancellationReason) {
      return "bg-gray-100 text-gray-800";
    }
    if (cancellationReason.includes("guide_wins")) {
      return "bg-emerald-100 text-emerald-800";
    }
    if (cancellationReason.includes("user_wins")) {
      return "bg-blue-100 text-blue-800";
    }
    if (cancellationReason.includes("split_cost")) {
      return "bg-amber-100 text-amber-800";
    }
    return "bg-gray-100 text-gray-800";
  }

  async function handleResolve() {
    if (!selectedDispute || !adminNotes.trim()) {
      alert("กรุณาระบุเหตุผลการตัดสิน");
      return;
    }

    setResolving(true);
    try {
      await onResolve(selectedDispute.TripBookingID, decision, adminNotes);

      // ปิด modal ตัดสิน และแสดง modal สำเร็จ จากนั้นสลับไปแท็บประวัติ
      setSelectedDispute(null);
      setAdminNotes("");
      setDecision("guide_wins");
      setShowSuccessModal(true);
      setHistoryTab("resolved");
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      alert("เกิดข้อผิดพลาดในการตัดสิน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setResolving(false);
    }
  }

  function renderDisputeCard(dispute: DisputeReport, showResolveButton: boolean) {
    const booking = dispute.TripBooking;
    const userName = booking?.User
      ? `${booking.User.FirstName} ${booking.User.LastName}`
      : "ไม่ระบุ";
    const guideName = booking?.Guide?.User
      ? `${booking.Guide.User.FirstName} ${booking.Guide.User.LastName}`
      : "ไม่ระบุ";

    const originalReport = dispute.OriginalReport || null;
    const originalDescription =
      originalReport?.Description || originalReport?.Title || "ไม่มีรายละเอียดจากไกด์";
    const disputeDescription =
      dispute.Description || dispute.Title || "ไม่มีรายละเอียดจากผู้ใช้";

    return (
      <div
        key={dispute.ID}
        className={`border rounded-xl p-4 transition-colors ${
          showResolveButton ? "border-gray-200 hover:border-purple-300" : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  showResolveButton ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                }`}
              >
                {showResolveButton ? "รอตัดสิน" : "ตัดสินแล้ว"}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(dispute.CreatedAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {!showResolveButton && dispute.ResolvedAt && (
                <span className="text-xs text-gray-500">
                  • ตัดสิน:{" "}
                  {new Date(dispute.ResolvedAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <h4 className="font-semibold text-gray-900 mb-1">{dispute.Title}</h4>
            <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{disputeDescription}</p>

            {!showResolveButton && booking?.CancellationReason && (
              <div className="mb-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDecisionColor(
                    booking.CancellationReason
                  )}`}
                >
                  การตัดสิน: {getDecisionLabel(booking.CancellationReason)}
                </span>
              </div>
            )}

            {!showResolveButton && dispute.AdminNotes && (
              <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">เหตุผลการตัดสิน:</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{dispute.AdminNotes}</p>
              </div>
            )}

            {originalReport && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  รายงานจากไกด์ (User No-Show)
                </p>
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{originalDescription}</p>
                  {originalReport.CreatedAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      รายงานเมื่อ: {new Date(originalReport.CreatedAt).toLocaleString("th-TH")}
                    </p>
                  )}
                  {originalReport.Evidence ? (
                    <div className="relative mt-3 w-48 h-32 rounded-lg overflow-hidden border border-blue-200 bg-white">
                      <Image
                        src={`${apiBaseUrl}${originalReport.Evidence}`}
                        alt="Guide report evidence"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-blue-600">ไม่มีหลักฐานที่แนบจากไกด์</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  {booking?.User?.Avatar ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200">
                      <Image
                        src={`${apiBaseUrl}${booking.User.Avatar}`}
                        alt={userName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold">
                      {booking?.User?.FirstName?.[0] || "U"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-blue-600 font-medium">ลูกค้า (User)</div>
                  <div className="font-medium text-gray-900 truncate">{userName}</div>
                  <div className="text-xs text-gray-500 truncate">{booking?.User?.Email || "-"}</div>
                </div>
              </div>

              {/* Guide Info */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <div className="flex-shrink-0">
                  {booking?.Guide?.User?.Avatar ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-200">
                      <Image
                        src={`${apiBaseUrl}${booking.Guide?.User?.Avatar}`}
                        alt={guideName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-semibold">
                      {booking?.Guide?.User?.FirstName?.[0] || "G"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-emerald-600 font-medium">ไกด์ (Guide)</div>
                  <div className="font-medium text-gray-900 truncate">{guideName}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {booking?.Guide?.User?.Email || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-2">
                <span className="text-gray-500 text-xs">วันเริ่มทริป:</span>
                <div className="font-medium text-gray-900">
                  {booking?.StartDate
                    ? new Date(booking.StartDate).toLocaleDateString("th-TH")
                    : "-"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <span className="text-gray-500 text-xs">ยอดเงิน:</span>
                <div className="font-medium text-gray-900">
                  ฿{booking?.TotalAmount?.toLocaleString() || "0"}
                </div>
              </div>
            </div>

            {dispute.Evidence && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">หลักฐานที่แนบ:</p>
                <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={`${apiBaseUrl}${dispute.Evidence}`}
                    alt="Evidence"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {showResolveButton && (
            <button
              onClick={() => setSelectedDispute(dispute)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              ตัดสิน
            </button>
          )}
        </div>
      </div>
    );
  }

  if (pendingDisputes.length === 0 && resolvedDisputes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ยังไม่มีข้อพิพาท</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setHistoryTab("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            historyTab === "pending"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ข้อพิพาทที่รอตัดสิน ({pendingDisputes.length})
        </button>
        <button
          onClick={() => setHistoryTab("resolved")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            historyTab === "resolved"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ประวัติข้อพิพาท ({resolvedDisputes.length})
        </button>
      </div>

      {/* Lists */}
      {historyTab === "pending" && (
        <div className="space-y-4">
          {pendingDisputes.map((dispute) => renderDisputeCard(dispute, true))}
          {pendingDisputes.length === 0 && (
            <div className="text-center py-8 text-gray-500">ไม่มีรายการรอตัดสิน</div>
          )}
        </div>
      )}

      {historyTab === "resolved" && (
        <div className="space-y-4">
          {resolvedDisputes.map((dispute) => renderDisputeCard(dispute, false))}
          {resolvedDisputes.length === 0 && (
            <div className="text-center py-8 text-gray-500">ยังไม่มีประวัติข้อพิพาท</div>
          )}
        </div>
      )}

      {/* Resolve Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">ตัดสินข้อพิพาท</h3>
              <p className="text-sm text-gray-500 mt-1">
                Booking ID: {selectedDispute.TripBookingID}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">สรุปกรณี</h4>
                <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
                  {selectedDispute.Description || selectedDispute.Title}
                </p>

                {selectedDispute.Evidence && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">หลักฐาน:</p>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={`${apiBaseUrl}${selectedDispute.Evidence}`}
                        alt="Evidence"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {selectedDispute.OriginalReport && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                      รายงานจากไกด์ (User No-Show)
                    </p>
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {selectedDispute.OriginalReport.Description ||
                          selectedDispute.OriginalReport.Title ||
                          "ไม่มีรายละเอียดจากไกด์"}
                      </p>
                      {selectedDispute.OriginalReport.CreatedAt && (
                        <p className="mt-2 text-xs text-gray-500">
                          รายงานเมื่อ:{" "}
                          {new Date(selectedDispute.OriginalReport.CreatedAt).toLocaleString(
                            "th-TH"
                          )}
                        </p>
                      )}
                      {selectedDispute.OriginalReport.Evidence ? (
                        <div className="relative mt-3 w-full h-64 rounded-lg overflow-hidden border border-blue-200 bg-white">
                          <Image
                            src={`${apiBaseUrl}${selectedDispute.OriginalReport.Evidence}`}
                            alt="Guide report evidence"
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-blue-600">ไม่มีหลักฐานที่แนบจากไกด์</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Decision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">การตัดสิน</label>

                <div className="space-y-2">
                  <label
                    className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: decision === "guide_wins" ? "#10b981" : "#e5e7eb" }}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="guide_wins"
                      checked={decision === "guide_wins"}
                      onChange={(e) => setDecision(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">ไกด์ชนะ</div>
                      <p className="text-sm text-gray-600">
                        ผู้ใช้ไม่มาตามนัด / หลักฐานฝ่ายไกด์ชัดเจนกว่า
                      </p>
                    </div>
                  </label>

                  <label
                    className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: decision === "user_wins" ? "#3b82f6" : "#e5e7eb" }}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="user_wins"
                      checked={decision === "user_wins"}
                      onChange={(e) => setDecision(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">ลูกค้าชนะ</div>
                      <p className="text-sm text-gray-600">ไกด์ไม่มาตามนัด / หลักฐานฝ่ายลูกค้าชัดเจน</p>
                    </div>
                  </label>

                  <label
                    className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: decision === "split_cost" ? "#f59e0b" : "#e5e7eb" }}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="split_cost"
                      checked={decision === "split_cost"}
                      onChange={(e) => setDecision(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">แบ่งค่าเสียหาย</div>
                      <p className="text-sm text-gray-600">ทั้งสองฝ่ายมีส่วนผิด / ข้อมูลไม่เพียงพอ</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  เหตุผลการตัดสิน (จำเป็น)
                </label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  rows={4}
                  placeholder="อธิบายเหตุผลและหลักฐานที่ใช้พิจารณา"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                disabled={resolving}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                disabled={resolving}
              >
                {resolving ? "กำลังตัดสิน..." : "ยืนยันการตัดสิน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal หลังตัดสิน */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="px-6 py-6 text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-600 text-xl">✓</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">ตัดสินข้อพิพาทเสร็จสิ้น</h4>
              <p className="text-sm text-gray-600 mt-1">
                ระบบย้ายเคสไปยัง <span className="font-medium">ประวัติข้อพิพาท</span> แล้ว
              </p>
            </div>
            <div className="px-6 pb-6 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setHistoryTab("resolved");
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700"
              >
                ไปที่ประวัติข้อพิพาท
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
