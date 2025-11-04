interface Quotation {
  TotalPrice: number;
  ValidUntil: string;
  PriceBreakdown?: string;
  Terms?: string;
  PaymentTerms?: string;
}

interface QuotationCardProps {
  quotation: Quotation;
}

export default function QuotationCard({ quotation }: QuotationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">💰 ใบเสนอราคา</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <span className="text-lg font-medium">ราคารวม:</span>
          <span className="text-2xl font-bold text-green-600">
            ฿{quotation.TotalPrice.toLocaleString()}
          </span>
        </div>

        {quotation.PriceBreakdown && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              📊 รายละเอียดค่าใช้จ่าย
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap font-sans text-gray-700">
                {quotation.PriceBreakdown}
              </pre>
            </div>
          </div>
        )}

        {quotation.Terms && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              📋 เงื่อนไขการให้บริการ
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap font-sans text-gray-700">
                {quotation.Terms}
              </pre>
            </div>
          </div>
        )}

        {quotation.PaymentTerms && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              💳 เงื่อนไขการชำระเงิน
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap font-sans text-gray-700">
                {quotation.PaymentTerms}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
