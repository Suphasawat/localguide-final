interface GuideFormActionsProps {
  loading: boolean;
  isFormValid: boolean;
  onCancel: () => void;
}

export default function GuideFormActions({
  loading,
  isFormValid,
  onCancel,
}: GuideFormActionsProps) {
  return (
    <div className="flex space-x-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
      >
        ยกเลิก
      </button>
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "กำลังส่ง..." : "ส่งคำขอ"}
      </button>
    </div>
  );
}
