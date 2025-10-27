interface TripRequire {
  ID: number;
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string;
  EndDate: string;
  Days: number;
  GroupSize: number;
  Province?: { Name: string };
}

type FormState = {
  title: string;
  description: string;
  totalPrice: number;
  validUntil: string;
};

interface OfferConfirmModalProps {
  show: boolean;
  formData: FormState;
  tripRequire: TripRequire;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export default function OfferConfirmModal({
  show,
  formData,
  tripRequire,
  onClose,
  onConfirm,
  submitting,
}: OfferConfirmModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          if (!submitting) {
            onClose();
          }
        }}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900">
          ยืนยันการส่งข้อเสนอ
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          ตรวจสอบรายละเอียดก่อนส่งไปยังลูกค้า
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <div className="text-gray-500">ชื่อแพ็กเกจ</div>
            <div className="font-medium text-gray-900">
              {formData.title || "-"}
            </div>
          </div>
          <div>
            <div className="text-gray-500">จังหวัด / วัน / คน</div>
            <div className="font-medium text-gray-900">
              {tripRequire.Province?.Name || "-"} / {tripRequire.Days} วัน /{" "}
              {tripRequire.GroupSize} คน
            </div>
          </div>
          <div>
            <div className="text-gray-500">ราคารวม</div>
            <div className="font-semibold text-gray-900">
              ฿{formData.totalPrice.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-500">ข้อเสนอมีผลถึง</div>
            <div className="font-medium text-gray-900">
              {formData.validUntil || "-"}
            </div>
          </div>
        </div>

        {formData.description && (
          <div className="mt-4">
            <div className="text-gray-500 text-sm">รายละเอียดแพ็กเกจ</div>
            <div className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-gray-200 p-3 text-gray-800">
              {formData.description}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (!submitting) {
                onClose();
              }
            }}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            แก้ไขต่อ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "กำลังส่ง..." : "ยืนยันส่งข้อเสนอ"}
          </button>
        </div>
      </div>
    </div>
  );
}
