"use client";

interface NoShowModalProps {
  show: boolean;
  reason: string;
  actionLoading: string | null;
  onReasonChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function NoShowModal({
  show,
  reason,
  actionLoading,
  onReasonChange,
  onClose,
  onSubmit,
}: NoShowModalProps) {
  if (!show) {
    return null;
  }

  const submitting = actionLoading === "report-no-show";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* ⭐ เปลี่ยน overlay จากดำทึบ เป็นโปร่ง/เบลอ */}
      <div
        className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* แถบโทนด้านบน */}
        <div className="h-2 rounded-t-2xl bg-red-600" />
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">รายงานไกด์ไม่มา</h3>
          <p className="mt-2 text-sm text-gray-600">
            โปรดระบุเหตุผลหรือรายละเอียดเพิ่มเติม
          </p>

          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={5}
            placeholder="รายละเอียด..."
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || reason.trim().length === 0}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? "กำลังส่ง..." : "ส่งรายงาน"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
