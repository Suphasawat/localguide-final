"use client";

import { useState } from "react";
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
  TripBooking?: {
    ID: number;
    StartDate: string;
    TotalAmount: number;
    Status?: string;
    CancellationReason?: string;
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
  onResolve: (
    bookingId: number,
    decision: string,
    reason: string
  ) => Promise<void>;
}

export default function DisputesTab({ disputes, onResolve }: DisputesTabProps) {
  const [selectedDispute, setSelectedDispute] = useState<DisputeReport | null>(
    null
  );
  const [decision, setDecision] = useState<
    "guide_wins" | "user_wins" | "split_cost"
  >("guide_wins");
  const [adminNotes, setAdminNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const [historyTab, setHistoryTab] = useState<"pending" | "resolved">(
    "pending"
  );

  const handleResolve = async () => {
    if (!selectedDispute || !adminNotes.trim()) {
      alert("กรุณาระบุเหตุผลการตัดสิน");
      return;
    }

    setResolving(true);
    try {
      await onResolve(selectedDispute.TripBookingID, decision, adminNotes);

      // Close modal and reset state
      setSelectedDispute(null);
      setAdminNotes("");
      setDecision("guide_wins");

      // Force reload to update the disputes list
      window.location.reload();
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      alert("เกิดข้อผิดพลาดในการตัดสิน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setResolving(false);
    }
  };

  const pendingDisputes = disputes.filter((d) => d.Status === "pending");
  const resolvedDisputes = disputes.filter((d) => d.Status === "resolved");

  const getDecisionLabel = (cancellationReason?: string) => {
    if (!cancellationReason) return "-";
    if (cancellationReason.includes("guide_wins"))
      return "ไกด์ชนะ (Guide Wins)";
    if (cancellationReason.includes("user_wins"))
      return "ลูกค้าชนะ (User Wins)";
    if (cancellationReason.includes("split_cost"))
      return "แบ่งค่าเสียหาย (Split Cost)";
    return cancellationReason;
  };

  const getDecisionColor = (cancellationReason?: string) => {
    if (!cancellationReason) return "bg-gray-100 text-gray-800";
    if (cancellationReason.includes("guide_wins"))
      return "bg-emerald-100 text-emerald-800";
    if (cancellationReason.includes("user_wins"))
      return "bg-blue-100 text-blue-800";
    if (cancellationReason.includes("split_cost"))
      return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-800";
  };

  const renderDisputeCard = (
    dispute: DisputeReport,
    showResolveButton: boolean
  ) => {
    const booking = dispute.TripBooking;
    const userName = booking?.User
      ? `${booking.User.FirstName} ${booking.User.LastName}`
      : "ไม่ระบุ";
    const guideName = booking?.Guide?.User
      ? `${booking.Guide.User.FirstName} ${booking.Guide.User.LastName}`
      : "ไม่ระบุ";

    return (
      <div
        key={dispute.ID}
        className={`border rounded-xl p-4 transition-colors ${
          showResolveButton
            ? "border-gray-200 hover:border-purple-300"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  showResolveButton
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
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

            <h4 className="font-semibold text-gray-900 mb-1">
              {dispute.Title}
            </h4>
            <p className="text-sm text-gray-600 mb-3">{dispute.Description}</p>

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
                <p className="text-sm text-gray-700">{dispute.AdminNotes}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* User Info with Avatar */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  {booking?.User?.Avatar ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200">
                      <Image
                        src={`${
                          process.env.NEXT_PUBLIC_API_URL?.replace(
                            "/api",
                            ""
                          ) || "http://localhost:8080"
                        }${booking.User.Avatar}`}
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
                  <div className="text-xs text-blue-600 font-medium">
                    ลูกค้า (User)
                  </div>
                  <div className="font-medium text-gray-900 truncate">
                    {userName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {booking?.User?.Email || "-"}
                  </div>
                </div>
              </div>

              {/* Guide Info with Avatar */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <div className="flex-shrink-0">
                  {booking?.Guide?.User?.Avatar ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-200">
                      <Image
                        src={`${
                          process.env.NEXT_PUBLIC_API_URL?.replace(
                            "/api",
                            ""
                          ) || "http://localhost:8080"
                        }${booking.Guide.User.Avatar}`}
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
                  <div className="text-xs text-emerald-600 font-medium">
                    ไกด์ (Guide)
                  </div>
                  <div className="font-medium text-gray-900 truncate">
                    {guideName}
                  </div>
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
                    src={`${
                      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
                      "http://localhost:8080"
                    }${dispute.Evidence}`}
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
  };

  if (pendingDisputes.length === 0 && resolvedDisputes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">ไม่มีข้อพิพาท</h3>
        <p className="mt-1 text-sm text-gray-500">
          ยังไม่มีรายการข้อพิพาทในระบบ
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setHistoryTab("pending")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              historyTab === "pending"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            รอตัดสิน ({pendingDisputes.length})
          </button>
          <button
            onClick={() => setHistoryTab("resolved")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              historyTab === "resolved"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            ประวัติการตัดสิน ({resolvedDisputes.length})
          </button>
        </nav>
      </div>

      {/* Pending Disputes */}
      {historyTab === "pending" && (
        <div>
          {pendingDisputes.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                ไม่มีข้อพิพาทที่ต้องตัดสิน
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                ทุกรายการได้รับการจัดการเรียบร้อยแล้ว
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDisputes.map((dispute) =>
                renderDisputeCard(dispute, true)
              )}
            </div>
          )}
        </div>
      )}

      {/* Resolved Disputes */}
      {historyTab === "resolved" && (
        <div>
          {resolvedDisputes.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                ไม่มีประวัติการตัดสิน
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                ยังไม่มีข้อพิพาทที่ได้รับการตัดสิน
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resolvedDisputes.map((dispute) =>
                renderDisputeCard(dispute, false)
              )}
            </div>
          )}
        </div>
      )}

      {/* Resolve Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">
                ตัดสินข้อพิพาท
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Booking ID: {selectedDispute.TripBookingID}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">สรุปกรณี</h4>
                <p className="text-sm text-gray-700 mb-3">
                  {selectedDispute.Description}
                </p>

                {selectedDispute.Evidence && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">หลักฐาน:</p>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={`${
                          process.env.NEXT_PUBLIC_API_URL?.replace(
                            "/api",
                            ""
                          ) || "http://localhost:8080"
                        }${selectedDispute.Evidence}`}
                        alt="Evidence"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Decision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  การตัดสิน
                </label>
                <div className="space-y-2">
                  <label
                    className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor:
                        decision === "guide_wins" ? "#10b981" : "#e5e7eb",
                    }}
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
                      <div className="font-medium text-gray-900">
                        ไกด์ชนะ (Guide Wins)
                      </div>
                      <div className="text-sm text-gray-500">
                        ไกด์ได้ 50%, คืนเงิน User 50%
                      </div>
                    </div>
                  </label>

                  <label
                    className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor:
                        decision === "user_wins" ? "#10b981" : "#e5e7eb",
                    }}
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
                      <div className="font-medium text-gray-900">
                        ลูกค้าชนะ (User Wins)
                      </div>
                      <div className="text-sm text-gray-500">
                        คืนเงิน User 100%, ไกด์ไม่ได้เงิน
                      </div>
                    </div>
                  </label>

                  <label
                    className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor:
                        decision === "split_cost" ? "#10b981" : "#e5e7eb",
                    }}
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
                      <div className="font-medium text-gray-900">
                        แบ่งค่าเสียหาย (Split Cost)
                      </div>
                      <div className="text-sm text-gray-500">
                        ไกด์ได้ 25%, คืนเงิน User 75%
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เหตุผลการตัดสิน <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ระบุเหตุผลและรายละเอียดการตัดสิน..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedDispute(null);
                  setAdminNotes("");
                  setDecision("guide_wins");
                }}
                disabled={resolving}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleResolve}
                disabled={resolving || !adminNotes.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {resolving ? "กำลังดำเนินการ..." : "ยืนยันการตัดสิน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
