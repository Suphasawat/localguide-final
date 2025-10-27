interface DeleteConfirmModalProps {
  show: boolean;
  title: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  show,
  title,
  loading,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">ยืนยันการลบ</h3>
        <p className="mt-2 text-sm text-gray-600">
          คุณต้องการลบ <span className="font-medium">"{title}"</span> หรือไม่?
          การดำเนินการนี้ไม่สามารถย้อนคืนได้
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={loading ? undefined : onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "กำลังลบ..." : "ลบ"}
          </button>
        </div>
      </div>
    </div>
  );
}
