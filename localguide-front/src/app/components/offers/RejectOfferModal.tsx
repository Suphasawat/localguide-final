import { TripOffer } from "@/app/types";

interface RejectOfferModalProps {
  show: boolean;
  offer: TripOffer | null;
  onClose: () => void;
  onConfirm: (offerId: number) => void;
  loading: boolean;
  reason: string;
  setReason: (reason: string) => void;
  getGuideName: (offer: any) => string;
}

export default function RejectOfferModal({
  show,
  offer,
  onClose,
  onConfirm,
  loading,
  reason,
  setReason,
  getGuideName,
}: RejectOfferModalProps) {
  if (!show || !offer) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-xl w-full shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">❌ ยืนยันการปฏิเสธข้อเสนอ</h3>
            <button
              onClick={() => (loading ? null : onClose())}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              aria-label="close"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <div className="text-gray-500">ชื่อข้อเสนอ</div>
              <div className="font-medium text-gray-900">{offer.Title}</div>
            </div>
            <div>
              <div className="text-gray-500">ไกด์</div>
              <div className="font-medium text-gray-900">
                {getGuideName(offer)}
              </div>
            </div>
            <div>
              <label className="block text-gray-500 mb-1">
                เหตุผล (ไม่บังคับ)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                rows={3}
                placeholder="เช่น ราคาเกินงบ ประเภททริปไม่ตรงความต้องการ ฯลฯ"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="mt-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3">
              เมื่อปฏิเสธแล้ว คุณยังสามารถยอมรับข้อเสนออื่นได้ในภายหลัง
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => (loading ? null : onClose())}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              onClick={() => onConfirm(offer.ID)}
              className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังปฏิเสธ...
                </>
              ) : (
                <>ยืนยันปฏิเสธ</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
