import { TripOffer, TripRequire } from "@/app/types";
import { useRouter } from "next/navigation";

interface OfferCardProps {
  offer: TripOffer;
  tripRequire: TripRequire;
  getGuideName: (offer: any) => string;
  getOfferPrice: (offer: any) => number | null;
  getGuideRating: (offer: any) => number | null;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onAccept: (offer: TripOffer) => void;
  onReject: (offer: TripOffer) => void;
}

export default function OfferCard({
  offer,
  tripRequire,
  getGuideName,
  getOfferPrice,
  getGuideRating,
  getStatusColor,
  getStatusText,
  onAccept,
  onReject,
}: OfferCardProps) {
  const router = useRouter();
  const canTakeAction =
    offer.Status === "sent" &&
    (tripRequire.Status === "open" || tripRequire.Status === "in_review");

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
        offer.Status === "accepted"
          ? "border-green-500"
          : offer.Status === "rejected"
          ? "border-red-500"
          : offer.Status === "expired"
          ? "border-gray-400"
          : "border-blue-500"
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {offer.Title}
            </h3>
            <p className="text-gray-600 mt-1">จาก: {getGuideName(offer)}</p>
          </div>
          <div className="text-right space-y-1">
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                offer.Status
              )}`}
            >
              {getStatusText(offer.Status)}
            </span>
            {getOfferPrice(offer) !== null && (
              <div>
                <div className="text-xs text-gray-500">ราคารวม</div>
                <div className="text-base font-bold text-gray-900">
                  ฿{Number(getOfferPrice(offer)).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-700">{offer.Description}</p>
        </div>

        {/* Guide Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">ข้อมูลไกด์</h4>
            {(offer as any).Guide?.ID && (
              <button
                onClick={() =>
                  router.push(`/guides/${(offer as any).Guide.ID}`)
                }
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                <span>⭐</span>
                ดูรีวิว
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>⭐ คะแนน: {getGuideRating(offer) ?? "ยังไม่มี"}/5</div>
          </div>
        </div>

        {/* Quotation */}
        {((offer as any).Quotation ||
          (offer as any).TripOfferQuotation?.[0]) && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-3">💰 ใบเสนอราคา</h4>
            {(() => {
              const quotation =
                (offer as any).Quotation ||
                (offer as any).TripOfferQuotation?.[0];
              if (!quotation) return null;

              return (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">ราคารวม:</span>
                    <span className="text-xl font-bold text-green-600">
                      {quotation.TotalPrice?.toLocaleString()} บาท
                    </span>
                  </div>

                  {quotation.PriceBreakdown && (
                    <div>
                      <strong className="text-sm">
                        📊 รายละเอียดค่าใช้จ่าย:
                      </strong>
                      <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">
                        <pre className="whitespace-pre-wrap font-sans">
                          {quotation.PriceBreakdown}
                        </pre>
                      </div>
                    </div>
                  )}

                  {quotation.Terms && (
                    <div>
                      <strong className="text-sm">
                        📋 เงื่อนไขการให้บริการ:
                      </strong>
                      <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">
                        <pre className="whitespace-pre-wrap font-sans">
                          {quotation.Terms}
                        </pre>
                      </div>
                    </div>
                  )}

                  {quotation.PaymentTerms && (
                    <div>
                      <strong className="text-sm">
                        💳 เงื่อนไขการชำระเงิน:
                      </strong>
                      <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">
                        <pre className="whitespace-pre-wrap font-sans">
                          {quotation.PaymentTerms}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Notes */}
        {offer.OfferNotes && (
          <div className="mb-4 bg-blue-50 p-4 rounded-lg">
            <strong className="text-sm text-blue-900">หมายเหตุจากไกด์:</strong>
            <p className="text-sm text-blue-700 mt-2 whitespace-pre-wrap">
              {offer.OfferNotes}
            </p>
          </div>
        )}

        {/* Itinerary */}
        {offer.Itinerary && (
          <div className="mb-4">
            <strong className="text-sm">กำหนดการท่องเที่ยว:</strong>
            <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-sans">
                {offer.Itinerary}
              </pre>
            </div>
          </div>
        )}

        {/* Services */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {offer.IncludedServices && (
            <div>
              <strong className="text-sm text-green-700">
                ✅ บริการที่รวมอยู่:
              </strong>
              <div className="text-sm text-gray-600 mt-2 bg-green-50 p-3 rounded-lg">
                <pre className="whitespace-pre-wrap font-sans">
                  {offer.IncludedServices}
                </pre>
              </div>
            </div>
          )}
          {offer.ExcludedServices && (
            <div>
              <strong className="text-sm text-red-700">
                ❌ บริการที่ไม่รวม:
              </strong>
              <div className="text-sm text-gray-600 mt-2 bg-red-50 p-3 rounded-lg">
                <pre className="whitespace-pre-wrap font-sans">
                  {offer.ExcludedServices}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sent date */}
        {offer.SentAt && (
          <div className="text-sm text-gray-500 mb-4">
            ส่งเมื่อ: {new Date(offer.SentAt).toLocaleDateString("th-TH")}{" "}
            {new Date(offer.SentAt).toLocaleTimeString("th-TH")}
          </div>
        )}

        {/* Actions */}
        {canTakeAction && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => onAccept(offer)}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              ✅ ยอมรับข้อเสนอ
            </button>
            <button
              className="flex-1 bg-gray-400 text-white py-3 px-4 rounded-md hover:bg-gray-500 transition-colors"
              onClick={() => onReject(offer)}
            >
              ❌ ปฏิเสธ
            </button>
          </div>
        )}

        {offer.Status === "sent" && !canTakeAction && (
          <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md">
            <span className="mr-2">🔒</span>
            ความต้องการนี้ปิดรับข้อเสนอแล้ว (Status: {tripRequire.Status})
          </div>
        )}

        {offer.Status === "accepted" && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <span className="mr-2">✅</span>
            คุณได้ยอมรับข้อเสนอนี้แล้ว
          </div>
        )}

        {offer.Status === "rejected" && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <span className="mr-2">❌</span>
            ข้อเสนอนี้ถูกปฏิเสธแล้ว
            {offer.RejectionReason && (
              <span className="ml-2 text-sm">({offer.RejectionReason})</span>
            )}
          </div>
        )}

        {offer.Status === "expired" && (
          <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md flex items-center">
            <span className="mr-2">⏰</span>
            ข้อเสนอนี้หมดอายุแล้ว
          </div>
        )}

        {offer.Status === "withdrawn" && (
          <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md flex items-center">
            <span className="mr-2">🚫</span>
            ไกด์ได้ถอนข้อเสนอนี้แล้ว
          </div>
        )}
      </div>
    </div>
  );
}
