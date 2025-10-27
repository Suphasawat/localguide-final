import Link from "next/link";

interface EmptyBookingsStateProps {
  userRole?: number;
}

export default function EmptyBookingsState({
  userRole,
}: EmptyBookingsStateProps) {
  const isGuide = userRole === 2;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ไม่มีการจองในขณะนี้
        </h3>
        {userRole && (
          <div className="text-sm text-gray-600 mb-4">
            คุณเข้าสู่ระบบในฐานะ:{" "}
            <span className="font-medium">
              {userRole === 1
                ? "ผู้ใช้ทั่วไป"
                : userRole === 2
                ? "ไกด์"
                : `Role ${userRole}`}
            </span>
          </div>
        )}

        {isGuide ? (
          <div className="mt-6 space-y-4">
            <p className="text-gray-700">
              💡 การจองจะปรากฏเมื่อลูกค้ายอมรับข้อเสนอของคุณ
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
              <p className="font-medium text-blue-900 mb-2">
                ขั้นตอนการได้รับการจอง:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>ดูความต้องการทริปจากลูกค้า</li>
                <li>เสนอแพ็กเกจทัวร์ของคุณ</li>
                <li>รอลูกค้ายอมรับข้อเสนอ</li>
                <li>เมื่อลูกค้ายอมรับ การจองจะปรากฏที่นี่</li>
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <Link
                href="/guide/browse-trips"
                className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-md hover:bg-emerald-700 transition-colors font-medium"
              >
                ดูความต้องการทริป
              </Link>
              <Link
                href="/guide/my-offers"
                className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                ดูข้อเสนอของฉัน
              </Link>
              <Link
                href="/dashboard"
                className="inline-block border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-gray-700">
              💡 การจองจะปรากฏเมื่อคุณยอมรับข้อเสนอจากไกด์
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
              <p className="font-medium text-blue-900 mb-2">
                ขั้นตอนการจองทริป:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>สร้างความต้องการทริปของคุณ</li>
                <li>รอไกด์เสนอแพ็กเกจ</li>
                <li>เลือกและยอมรับข้อเสนอที่ชอบ</li>
                <li>ชำระเงินและเริ่มต้นทริป</li>
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <Link
                href="/user/trip-requires"
                className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                สร้างความต้องการทริป
              </Link>
              <Link
                href="/dashboard"
                className="inline-block border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
