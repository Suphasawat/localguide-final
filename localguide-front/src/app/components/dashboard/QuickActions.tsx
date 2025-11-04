import Link from "next/link";

interface QuickActionsProps {
  isUser: boolean;
  isGuide: boolean;
  isAdmin: boolean;
}

export default function QuickActions({
  isUser,
  isGuide,
  isAdmin,
}: QuickActionsProps) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        เริ่มต้นการเดินทาง
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* เมนูของไกด์ */}
        {isGuide && (
          <>
            <Link
              href="/guide/browse-trips"
              className="group bg-white border-2 border-emerald-200 hover:border-emerald-400 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="text-4xl mb-3">🧭</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ดูความต้องการเที่ยว
              </h3>
              <p className="text-sm text-gray-600">หาโอกาสงานใหม่</p>
            </Link>

            <Link
              href="/guide/my-offers"
              className="group bg-white border-2 border-blue-200 hover:border-blue-400 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="text-4xl mb-3">📩</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ข้อเสนอของฉัน
              </h3>
              <p className="text-sm text-gray-600">จัดการข้อเสนอ</p>
            </Link>
          </>
        )}

        {/* เมนูของแอดมิน */}
        {isAdmin && (
          <Link
            href="/admin"
            className="group bg-white border-2 border-rose-200 hover:border-rose-400 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="text-4xl mb-3">🛠️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              เข้าสู่แผงผู้ดูแล
            </h3>
            <p className="text-sm text-gray-600">จัดการระบบและผู้ใช้งาน</p>
          </Link>
        )}

        {/* เมนูของผู้ใช้ทั่วไป */}
        {isUser && (
          <>
            <Link
              href="/user/trip-requires/create"
              className="group bg-white border-2 border-emerald-200 hover:border-emerald-400 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                โพสต์ความต้องการ
              </h3>
              <p className="text-sm text-gray-600">หาไกด์ใหม่</p>
            </Link>

            <Link
              href="/user/trip-requires"
              className="group bg-white border-2 border-blue-200 hover:border-blue-400 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ความต้องการของฉัน
              </h3>
              <p className="text-sm text-gray-600">จัดการโพสต์</p>
            </Link>
          </>
        )}

        {/* ปุ่มที่ใช้ร่วมกันสำหรับ User และ Guide เท่านั้น */}
        {(isUser || isGuide) && (
          <Link
            href="/trip-bookings"
            className="group bg-white border-2 border-emerald-200 hover:border-emerald-400 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="text-4xl mb-3">🧳</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              การจองของฉัน
            </h3>
            <p className="text-sm text-gray-600">ดูและจัดการการจอง</p>
          </Link>
        )}

        <Link
          href="/profile"
          className="group bg-white border-2 border-gray-300 hover:border-gray-400 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="text-4xl mb-3">👤</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">โปรไฟล์</h3>
          <p className="text-sm text-gray-600">แก้ไขข้อมูลส่วนตัว</p>
        </Link>
      </div>
    </div>
  );
}
