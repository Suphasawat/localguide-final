interface OfferDetailsProps {
  description: string;
  itinerary?: string;
  includedServices?: string;
  excludedServices?: string;
  offerNotes?: string;
}

export default function OfferDetails({
  description,
  itinerary,
  includedServices,
  excludedServices,
  offerNotes,
}: OfferDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">รายละเอียดข้อเสนอ</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-700 mb-2">รายละเอียดแพ็กเกจ</h3>
          <p className="text-gray-600">{description}</p>
        </div>

        {itinerary && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">กำหนดการเที่ยว</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap font-sans text-gray-700">
                {itinerary}
              </pre>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {includedServices && (
            <div>
              <h3 className="font-medium text-green-700 mb-2">
                ✅ บริการที่รวมอยู่
              </h3>
              <div className="bg-green-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-sans text-gray-700">
                  {includedServices}
                </pre>
              </div>
            </div>
          )}
          {excludedServices && (
            <div>
              <h3 className="font-medium text-red-700 mb-2">
                ❌ บริการที่ไม่รวม
              </h3>
              <div className="bg-red-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-sans text-gray-700">
                  {excludedServices}
                </pre>
              </div>
            </div>
          )}
        </div>

        {offerNotes && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              หมายเหตุเพิ่มเติม
            </h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap font-sans text-gray-700">
                {offerNotes}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
