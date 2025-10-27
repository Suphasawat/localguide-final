"use client";

interface TripInformationProps {
  booking: any;
  getTripTitle: (booking: any) => string;
  getProvince: (booking: any) => string;
  getTripRequireTitle: (booking: any) => string;
  getTripDays: (booking: any) => string | number;
}

export default function TripInformation({
  booking,
  getTripTitle,
  getProvince,
  getTripRequireTitle,
  getTripDays,
}: TripInformationProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">ข้อมูลทริป</h2>
      <div className="space-y-2">
        <div>
          <span className="text-sm text-gray-500">ชื่อทริป:</span>{" "}
          <span className="font-medium">{getTripTitle(booking)}</span>
        </div>
        <div>
          <span className="text-sm text-gray-500">จังหวัด:</span>{" "}
          <span className="font-medium">{getProvince(booking)}</span>
        </div>
        <div>
          <span className="text-sm text-gray-500">หัวข้อความต้องการ:</span>{" "}
          <span className="font-medium">{getTripRequireTitle(booking)}</span>
        </div>
        <div>
          <span className="text-sm text-gray-500">จำนวนวัน:</span>{" "}
          <span className="font-medium">{getTripDays(booking)}</span>
        </div>
      </div>
    </div>
  );
}
