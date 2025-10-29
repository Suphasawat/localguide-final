import { TripOffer } from "@/app/types";

interface AcceptOfferModalProps {
  show: boolean;
  offer: TripOffer | null;
  onClose: () => void;
  onConfirm: (offerId: number) => void;
  loading: boolean;
  getGuideName: (offer: any) => string;
  getOfferPrice: (offer: any) => number | null;
}

export default function AcceptOfferModal({
  show,
  offer,
  onClose,
  onConfirm,
  loading,
  getGuideName,
  getOfferPrice,
}: AcceptOfferModalProps) {
  if (!show || !offer) return null;

  const q = offer.Quotation || (offer as any).TripOfferQuotation?.[0];

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-xl w-full shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">✅ ยืนยันการยอมรับข้อเสนอ</h3>
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
            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="text-gray-500">ราคารวม</div>
                <div className="text-lg font-bold text-green-700">
                  ฿
                  {(
                    q?.TotalPrice ??
                    getOfferPrice(offer) ??
                    0
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-2 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-3">
              การยอมรับข้อเสนอนี้จะปฏิเสธข้อเสนออื่นๆ โดยอัตโนมัติ
              และจะพาไปยังหน้าการจอง
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
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังยอมรับ...
                </>
              ) : (
                <>ยืนยันยอมรับ</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
