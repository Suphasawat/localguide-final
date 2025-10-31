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
  TripBooking?: {
    ID: number;
    StartDate: string;
    TotalAmount: number;
    User?: {
      FirstName: string;
      LastName: string;
      Email: string;
    };
    Guide?: {
      User?: {
        FirstName: string;
        LastName: string;
        Email: string;
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

  const handleResolve = async () => {
    if (!selectedDispute || !adminNotes.trim()) {
      alert("กรุณาระบุเหตุผลการตัดสิน");
      return;
    }

    setResolving(true);
    try {
      await onResolve(selectedDispute.TripBookingID, decision, adminNotes);
      setSelectedDispute(null);
      setAdminNotes("");
      setDecision("guide_wins");
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
    } finally {
      setResolving(false);
    }
  };

  const pendingDisputes = disputes.filter((d) => d.Status === "pending");

  if (pendingDisputes.length === 0) {
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
        <h3 className="text-lg font-medium text-gray-900">
          ไม่มีข้อพิพาทที่ต้องตัดสิน
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          ทุกรายการได้รับการจัดการเรียบร้อยแล้ว
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ข้อพิพาท No-Show ({pendingDisputes.length})
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          รายการโต้แย้งที่รอการตัดสินจาก Admin
        </p>
      </div>

      <div className="space-y-4">
        {pendingDisputes.map((dispute) => {
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
              className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {dispute.ReportType === "dispute_no_show"
                        ? "โต้แย้งการรีพอร์ต"
                        : dispute.ReportType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(dispute.CreatedAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-1">
                    {dispute.Title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {dispute.Description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">ลูกค้า:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {userName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">ไกด์:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {guideName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">วันเริ่มทริป:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {booking?.StartDate
                          ? new Date(booking.StartDate).toLocaleDateString(
                              "th-TH"
                            )
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">ยอดเงิน:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        ฿{booking?.TotalAmount?.toLocaleString() || "0"}
                      </span>
                    </div>
                  </div>

                  {dispute.Evidence && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">
                        หลักฐานที่แนบ:
                      </p>
                      <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={`${
                            process.env.NEXT_PUBLIC_API_URL?.replace(
                              "/api",
                              ""
                            ) || "http://localhost:8080"
                          }${dispute.Evidence}`}
                          alt="Evidence"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedDispute(dispute)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  ตัดสิน
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
