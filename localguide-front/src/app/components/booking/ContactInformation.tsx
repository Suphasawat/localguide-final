"use client";

interface ContactInformationProps {
  booking: any;
  getUserName: (booking: any) => string;
  getUserPhone: (booking: any) => string;
  getGuideName: (booking: any) => string;
  getGuidePhone: (booking: any) => string;
}

export default function ContactInformation({
  booking,
  getUserName,
  getUserPhone,
  getGuideName,
  getGuidePhone,
}: ContactInformationProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">ข้อมูลติดต่อ</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">ผู้จอง</div>
          <div className="font-medium">{getUserName(booking)}</div>
          <div className="text-sm text-gray-600">
            โทร: {getUserPhone(booking)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">ไกด์</div>
          <div className="font-medium">{getGuideName(booking)}</div>
          <div className="text-sm text-gray-600">
            โทร: {getGuidePhone(booking)}
          </div>
        </div>
      </div>
    </div>
  );
}
