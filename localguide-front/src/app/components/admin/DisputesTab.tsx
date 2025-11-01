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
  Description: string;         // ข้อความที่ "ผู้ใช้" ส่งมาตอนโต้แย้ง
  Evidence: string;            // รูปจากผู้ใช้
  Status: string;
  CreatedAt: string;           // เวลา ผู้ใช้ รายงาน
  ResolvedAt?: string;
  AdminNotes?: string;
  OriginalReport?: {           // ฝั่งไกด์รายงาน no-show เดิม
    ID: number;
    Title: string;
    Description?: string;
    Evidence?: string;         // รูปจากไกด์
    CreatedAt?: string;        // เวลา ไกด์ รายงาน
  } | null;
  TripBooking?: {
    ID: number;
    StartDate: string;
    TotalAmount: number;
    Status?: string;
    CancellationReason?: string; // guide_wins | user_wins | split_cost
    User?: { FirstName: string; LastName: string; Email: string; Avatar?: string };
    Guide?: { User?: { FirstName: string; LastName: string; Email: string; Avatar?: string } };
  };
}

interface DisputesTabProps {
  disputes: DisputeReport[];
  onResolve: (bookingId: number, decision: string, reason: string) => Promise<void>;
}

export default function DisputesTab({ disputes, onResolve }: DisputesTabProps) {
  const [selectedDispute, setSelectedDispute] = useState<DisputeReport | null>(null);
  const [decision, setDecision] = useState<"guide_wins" | "user_wins" | "split_cost">("guide_wins");
  const [adminNotes, setAdminNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const [historyTab, setHistoryTab] = useState<"pending" | "resolved">("pending");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8080";

  const fmtDT = (s?: string) =>
    s ? new Date(s).toLocaleString("th-TH", { hour12: false }) : "-";

  const { pendingDisputes, resolvedDisputes } = useMemo(() => {
    const pending: DisputeReport[] = [];
    const resolved: DisputeReport[] = [];
    for (const d of disputes || []) {
      if (d.ResolvedAt || d.TripBooking?.CancellationReason) {
        resolved.push(d);
      } else {
        pending.push(d);
      }
    }
    return { pendingDisputes: pending, resolvedDisputes: resolved };
  }, [disputes]);

  function getDecisionLabel(reason?: string) {
    if (!reason) return "ไม่ทราบผลการตัดสิน";
    if (reason.includes("guide_wins")) return "ไกด์ชนะ";
    if (reason.includes("user_wins")) return "ลูกค้าชนะ";
    if (reason.includes("split_cost")) return "แบ่งค่าเสียหาย";
    return reason;
  }
  function getDecisionColor(reason?: string) {
    if (!reason) return "bg-gray-100 text-gray-800";
    if (reason.includes("guide_wins")) return "bg-emerald-100 text-emerald-800";
    if (reason.includes("user_wins")) return "bg-teal-100 text-teal-800";
    if (reason.includes("split_cost")) return "bg-amber-100 text-amber-800";
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
      setSelectedDispute(null);
      setAdminNotes("");
      setDecision("guide_wins");
      setShowSuccessModal(true);
      setHistoryTab("resolved");
    } catch (e) {
      console.error(e);
      alert("เกิดข้อพิพลาดในการตัดสิน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setResolving(false);
    }
  }

  /** สร้างข้อมูลสำหรับแกลเลอรีด้านบน: รูป + เวลา + ข้อความ */
  function evidenceList(d: DisputeReport) {
    const list: Array<{
      role: "guide" | "user";
      label: string;
      url: string;
      reportedAt: string;
      message: string;
    }> = [];
    if (d.OriginalReport?.Evidence) {
      list.push({
        role: "guide",
        label: "ไกด์",
        url: `${apiBaseUrl}${d.OriginalReport.Evidence}`,
        reportedAt: fmtDT(d.OriginalReport.CreatedAt),
        message: d.OriginalReport.Description || d.OriginalReport.Title || "—",
      });
    }
    if (d.Evidence) {
      list.push({
        role: "user",
        label: "ผู้ใช้",
        url: `${apiBaseUrl}${d.Evidence}`,
        reportedAt: fmtDT(d.CreatedAt),
        message: d.Description || d.Title || "—",
      });
    }
    return list;
  }

  /** ---------- การ์ดแต่ละเคส ---------- */
  function renderDisputeCard(dispute: DisputeReport, isPending: boolean) {
    const booking = dispute.TripBooking;
    const userName = booking?.User
      ? `${booking.User.FirstName} ${booking.User.LastName}`
      : "ไม่ระบุ";
    const guideName = booking?.Guide?.User
      ? `${booking.Guide.User.FirstName} ${booking.Guide.User.LastName}`
      : "ไม่ระบุ";
    const evs = evidenceList(dispute);

    return (
      <div
        key={dispute.ID}
        className="rounded-2xl border border-emerald-200 bg-white shadow-sm hover:shadow-md transition"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                isPending
                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-200"
              }`}
            >
              {isPending ? "รอตัดสิน" : "ตัดสินแล้ว"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(dispute.CreatedAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            {!isPending && dispute.ResolvedAt && (
              <span className="text-xs text-gray-500">
                • ตัดสิน{" "}
                {new Date(dispute.ResolvedAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          {isPending && (
            <button
              onClick={() => setSelectedDispute(dispute)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              ตัดสิน
            </button>
          )}
        </div>

        {/* รูปอยู่ด้านบน “คู่กัน” + เวลา + ข้อความ */}
        {evs.length > 0 && (
          <div className="px-5 pt-4">
            <div className={`grid gap-3 ${evs.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {evs.map((ev, i) => (
                <figure
                  key={i}
                  className="relative w-full overflow-hidden rounded-xl border border-emerald-200 bg-white"
                >
                  <div className="relative h-44 w-full sm:h-56">
                    <Image src={ev.url} alt={ev.label} fill className="object-cover" />
                  </div>
                  <figcaption className="border-t border-emerald-100 bg-emerald-50/60 px-3 py-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center rounded-md bg-emerald-600/90 px-2 py-0.5 text-white">
                        {ev.label}
                      </span>
                      <span className="text-gray-600">
                        รายงานเมื่อ:{" "}
                        <span className="font-medium text-gray-800">{ev.reportedAt}</span>
                      </span>
                    </div>
                    {/* ข้อความจากฝั่งนั้นๆ */}
                    <p className="mt-1 text-[13px] leading-5 text-gray-800 whitespace-pre-line">
                      {ev.message}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* ชื่อเคส + คำอธิบายรวม (คงไว้) */}
        <div className="px-5 pt-4">
          <h4 className="text-base font-semibold text-gray-900">{dispute.Title}</h4>
          <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
            {dispute.Description || "—"}
          </p>
        </div>

        {/* ส่วนล่างเดิม */}
        <div className="space-y-4 px-5 pb-5 pt-4">
          {!isPending && booking?.CancellationReason && (
            <div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getDecisionColor(
                  booking.CancellationReason
                )}`}
              >
                การตัดสิน: {getDecisionLabel(booking.CancellationReason)}
              </span>
              {dispute.AdminNotes && (
                <span className="ml-2 text-sm text-gray-700">
                  • เหตุผล: <span className="text-gray-900">{dispute.AdminNotes}</span>
                </span>
              )}
            </div>
          )}

          {/* ผู้เกี่ยวข้อง */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
              <p className="mb-3 text-sm font-medium text-emerald-900">ผู้เกี่ยวข้อง</p>
              <div className="grid gap-3">
                <PartyCard
                  title="ลูกค้า (User)"
                  name={booking?.User ? `${booking.User.FirstName} ${booking.User.LastName}` : "ไม่ระบุ"}
                  email={booking?.User?.Email || "-"}
                  avatarUrl={booking?.User?.Avatar ? `${apiBaseUrl}${booking.User.Avatar}` : undefined}
                  fallback="U"
                />
                <PartyCard
                  title="ไกด์ (Guide)"
                  name={
                    booking?.Guide?.User
                      ? `${booking.Guide.User.FirstName} ${booking.Guide.User.LastName}`
                      : "ไม่ระบุ"
                  }
                  email={booking?.Guide?.User?.Email || "-"}
                  avatarUrl={
                    booking?.Guide?.User?.Avatar
                      ? `${apiBaseUrl}${booking.Guide.User.Avatar}`
                      : undefined
                  }
                  fallback="G"
                />
              </div>
            </section>

            {/* รายละเอียดทริป */}
            <section className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
              <p className="mb-3 text-sm font-medium text-emerald-900">รายละเอียดทริป</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoBox label="วันเริ่มทริป" value={booking?.StartDate ? new Date(booking.StartDate).toLocaleDateString("th-TH") : "-"} />
                <InfoBox label="ยอดเงิน" value={`฿${booking?.TotalAmount?.toLocaleString() || "0"}`} />
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  /** ---------- UI sub-components (ง่ายๆ) ---------- */
  function PartyCard({
    title,
    name,
    email,
    avatarUrl,
    fallback,
  }: {
    title: string;
    name: string;
    email: string;
    avatarUrl?: string;
    fallback: string;
  }) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-emerald-100">
        {avatarUrl ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-emerald-200">
            <Image src={avatarUrl} alt={name} fill className="object-cover" />
          </div>
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-200/70 text-emerald-800 font-semibold">
            {fallback}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-xs text-emerald-700">{title}</div>
          <div className="truncate font-medium text-gray-900">{name}</div>
          <div className="truncate text-xs text-gray-600">{email}</div>
        </div>
      </div>
    );
  }

  function InfoBox({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-lg bg-white p-3 ring-1 ring-emerald-100">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-medium text-gray-900">{value}</div>
      </div>
    );
  }

  if (pendingDisputes.length === 0 && resolvedDisputes.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">ยังไม่มีข้อพิพาท</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setHistoryTab("pending")}
          className={`rounded-xl border px-4 py-2 text-sm font-medium ${
            historyTab === "pending"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-gray-700 border-emerald-200 hover:bg-emerald-50"
          }`}
        >
          ข้อพิพาทที่รอตัดสิน ({pendingDisputes.length})
        </button>
        <button
          onClick={() => setHistoryTab("resolved")}
          className={`rounded-xl border px-4 py-2 text-sm font-medium ${
            historyTab === "resolved"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-gray-700 border-emerald-200 hover:bg-emerald-50"
          }`}
        >
          ประวัติข้อพิพาท ({resolvedDisputes.length})
        </button>
      </div>

      {/* Lists */}
      {historyTab === "pending" && <div className="space-y-4">{pendingDisputes.map((d) => renderDisputeCard(d, true))}</div>}
      {historyTab === "resolved" && <div className="space-y-4">{resolvedDisputes.map((d) => renderDisputeCard(d, false))}</div>}

      {/* Modal */}
      {selectedDispute && (
        <ResolveModal
          dispute={selectedDispute}
          decision={decision}
          setDecision={setDecision}
          adminNotes={adminNotes}
          setAdminNotes={setAdminNotes}
          onClose={() => setSelectedDispute(null)}
          onConfirm={handleResolve}
          resolving={resolving}
          evidenceList={evidenceList}
          fmtDT={fmtDT}
          getDecisionColor={getDecisionColor}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white shadow-2xl">
            <div className="px-6 py-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-100">
                <span className="text-xl text-emerald-600">✓</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">ตัดสินข้อพิพาทเสร็จสิ้น</h4>
              <p className="mt-1 text-sm text-gray-600">
                ระบบย้ายเคสไปยัง <span className="font-medium text-emerald-700">ประวัติข้อพิพาท</span> แล้ว
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setHistoryTab("resolved");
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                ไปที่ประวัติข้อพิพาท
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50"
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

/** ---------------- Modal component (รวมข้อความใต้รูปเหมือนการ์ด) ---------------- */
function ResolveModal({
  dispute,
  decision,
  setDecision,
  adminNotes,
  setAdminNotes,
  onClose,
  onConfirm,
  resolving,
  evidenceList,
}: {
  dispute: DisputeReport;
  decision: "guide_wins" | "user_wins" | "split_cost";
  setDecision: (d: any) => void;
  adminNotes: string;
  setAdminNotes: (s: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  resolving: boolean;
  evidenceList: (d: DisputeReport) => Array<{
    role: "guide" | "user";
    label: string;
    url: string;
    reportedAt: string;
    message: string;
  }>;
  fmtDT: (s?: string) => string;
  getDecisionColor: (s?: string) => string;
}) {
  const evs = evidenceList(dispute);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-200 bg-white shadow-2xl">
        <div className="sticky top-0 rounded-t-2xl border-b border-emerald-100 bg-white px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900">ตัดสินข้อพิพาท</h3>
          <p className="mt-1 text-sm text-gray-600">Booking ID: {dispute.TripBookingID}</p>
        </div>

        {/* แกลเลอรีด้านบน (ภาพ + เวลา + ข้อความ) */}
        {evs.length > 0 && (
          <div className="px-6 pt-6">
            <div className={`grid gap-3 ${evs.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {evs.map((ev, idx) => (
                <figure
                  key={idx}
                  className="relative w-full overflow-hidden rounded-xl border border-emerald-200 bg-white"
                >
                  <div className="relative h-56 w-full">
                    <Image src={ev.url} alt={ev.label} fill className="object-contain" />
                  </div>
                  <figcaption className="border-t border-emerald-100 bg-emerald-50/60 px-3 py-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center rounded-md bg-emerald-600/90 px-2 py-0.5 text-white">
                        {ev.label}
                      </span>
                      <span className="text-gray-600">
                        รายงานเมื่อ:{" "}
                        <span className="font-medium text-gray-800">{ev.reportedAt}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-5 text-gray-800 whitespace-pre-line">
                      {ev.message}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* สรุปกรณี */}
        <div className="space-y-6 p-6">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <h4 className="mb-2 font-semibold text-gray-900">สรุปกรณี</h4>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {dispute.Description || dispute.Title}
            </p>
          </div>

          {/* การตัดสิน */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-900">การตัดสิน</label>
            <div className="space-y-3">
              <RadioRow
                checked={decision === "guide_wins"}
                onChange={() => setDecision("guide_wins")}
                accent="#10b981"
                title="ไกด์ชนะ"
                desc="ผู้ใช้ไม่มาตามนัด / หลักฐานฝ่ายไกด์ชัดเจนกว่า"
              />
              <RadioRow
                checked={decision === "user_wins"}
                onChange={() => setDecision("user_wins")}
                accent="#14b8a6"
                title="ลูกค้าชนะ"
                desc="ไกด์ไม่มาตามนัด / หลักฐานฝ่ายลูกค้าชัดเจน"
              />
              <RadioRow
                checked={decision === "split_cost"}
                onChange={() => setDecision("split_cost")}
                accent="#f59e0b"
                title="แบ่งค่าเสียหาย"
                desc="ทั้งสองฝ่ายมีส่วนผิด / ข้อมูลไม่เพียงพอ"
              />
            </div>
          </div>

          {/* เหตุผล */}
          <div>
            <label htmlFor="adminNotes" className="mb-2 block text-sm font-medium text-gray-900">
              เหตุผลการตัดสิน (จำเป็น)
            </label>
            <textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full rounded-xl border border-emerald-200 bg-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              rows={4}
              placeholder="อธิบายเหตุผลและหลักฐานที่ใช้พิจารณา"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-b-2xl border-t border-emerald-100 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50"
            disabled={resolving}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            disabled={resolving}
          >
            {resolving ? "กำลังตัดสิน..." : "ยืนยันการตัดสิน"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RadioRow({
  checked,
  onChange,
  accent,
  title,
  desc,
}: {
  checked: boolean;
  onChange: () => void;
  accent: string;
  title: string;
  desc: string;
}) {
  return (
    <label
      className="flex cursor-pointer items-start rounded-xl border-2 bg-white p-4 transition-colors hover:bg-emerald-50"
      style={{ borderColor: checked ? accent : "#e5e7eb" }}
    >
      <input type="radio" checked={checked} onChange={onChange} className="mt-1" />
      <div className="ml-3 flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </label>
  );
}
