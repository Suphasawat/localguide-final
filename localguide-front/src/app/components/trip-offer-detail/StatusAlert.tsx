interface StatusAlertProps {
  status: string;
}

export default function StatusAlert({ status }: StatusAlertProps) {
  if (status === "accepted") {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">✅</span>
          <div>
            <p className="font-semibold">ข้อเสนอนี้ได้รับการยอมรับแล้ว</p>
            <p className="text-sm mt-1">
              ลูกค้าได้ยอมรับข้อเสนอของคุณแล้ว
              คุณสามารถดูรายละเอียดการจองได้ที่หน้า "การจองทริป"
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">❌</span>
          <div>
            <p className="font-semibold">ข้อเสนอนี้ถูกปฏิเสธ</p>
            <p className="text-sm mt-1">ลูกค้าได้ปฏิเสธข้อเสนอนี้แล้ว</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">⏰</span>
          <div>
            <p className="font-semibold">ข้อเสนอนี้หมดอายุแล้ว</p>
            <p className="text-sm mt-1">
              ข้อเสนอนี้หมดอายุแล้วเนื่องจากเกินระยะเวลาที่กำหนด
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">⏳</span>
          <div>
            <p className="font-semibold">รอลูกค้าตอบรับ</p>
            <p className="text-sm mt-1">
              ข้อเสนอนี้ส่งไปยังลูกค้าแล้ว กำลังรอการตอบรับ
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
