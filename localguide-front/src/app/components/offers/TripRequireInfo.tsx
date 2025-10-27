import { TripRequire } from "@/app/types";

interface TripRequireInfoProps {
  tripRequire: TripRequire;
  offers: any[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export default function TripRequireInfo({
  tripRequire,
  offers,
  getStatusColor,
  getStatusText,
}: TripRequireInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">ความต้องการของคุณ</h2>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-lg">{tripRequire.Title}</h3>
          <p className="text-gray-600 mt-2">{tripRequire.Description}</p>
        </div>
        <span
          className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
            tripRequire.Status
          )}`}
        >
          {getStatusText(tripRequire.Status)}
        </span>
      </div>

      {/* Statistics */}
      {offers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {offers.length}
            </div>
            <div className="text-sm text-gray-600">ข้อเสนอทั้งหมด</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {offers.filter((offer) => offer.Status === "sent").length}
            </div>
            <div className="text-sm text-gray-600">รอการตอบรับ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {offers.filter((offer) => offer.Status === "accepted").length}
            </div>
            <div className="text-sm text-gray-600">ยอมรับแล้ว</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {offers.filter((offer) => offer.Status === "rejected").length}
            </div>
            <div className="text-sm text-gray-600">ปฏิเสธแล้ว</div>
          </div>
        </div>
      )}
    </div>
  );
}
