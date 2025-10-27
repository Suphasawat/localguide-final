"use client";

interface NoShowModalProps {
  show: boolean;
  reason: string;
  actionLoading: string | null;
  onReasonChange: (reason: string) => void;
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
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">รายงานลูกค้าไม่มา</h3>
        <p className="text-sm text-gray-600 mb-3">
          โปรดระบุเหตุผลหรือรายละเอียดเพิ่มเติม
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 mb-4"
          rows={4}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="รายละเอียด..."
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border"
          >
            ยกเลิก
          </button>
          <button
            onClick={onSubmit}
            disabled={actionLoading === "report-no-show"}
            className="px-4 py-2 text-sm rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
          >
            {actionLoading === "report-no-show" ? "กำลังส่ง..." : "ส่งรายงาน"}
          </button>
        </div>
      </div>
    </div>
  );
}
