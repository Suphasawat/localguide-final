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
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* เมนูของไกด์ */}
      {isGuide && (
        <>
          <Link
            href="/guide/browse-trips"
            className="group bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl text-center shadow hover:shadow-lg transition hover:-translate-y-0.5"
          >
            <div className="text-3xl mb-1">🧭</div>
            <h3 className="text-lg font-semibold mb-1">ดูความต้องการเที่ยว</h3>
            <p className="text-sm text-white/90">หาโอกาสงานใหม่</p>
          </Link>

          <Link
            href="/guide/my-offers"
            className="group bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl text-center shadow hover:shadow-lg transition hover:-translate-y-0.5"
          >
            <div className="text-3xl mb-1">📩</div>
            <h3 className="text-lg font-semibold mb-1">ข้อเสนอของฉัน</h3>
            <p className="text-sm text-white/90">จัดการข้อเสนอ</p>
          </Link>
        </>
      )}

      {/* เมนูของแอดมิน */}
      {isAdmin && (
        <Link
          href="/admin"
          className="group bg-gradient-to-br from-rose-500 to-red-600 text-white p-6 rounded-xl text-center shadow hover:shadow-lg transition hover:-translate-y-0.5"
        >
          <div className="text-3xl mb-1">🛠️</div>
          <h3 className="text-lg font-semibold mb-1">เข้าสู่แผงผู้ดูแล</h3>
          <p className="text-sm text-white/90">จัดการระบบและผู้ใช้งาน</p>
        </Link>
      )}

      {/* เมนูของผู้ใช้ทั่วไป */}
      {isUser && (
        <>
          <Link
            href="/user/trip-requires/create"
            className="group bg-gradient-to-br from-blue-500 to-sky-600 text-white p-6 rounded-xl text-center shadow hover:shadow-lg transition hover:-translate-y-0.5"
          >
            <div className="text-3xl mb-1">📝</div>
            <h3 className="text-lg font-semibold mb-1">โพสต์ความต้องการ</h3>
            <p className="text-sm text-white/90">หาไกด์ใหม่</p>
          </Link>

          <Link
            href="/user/trip-requires"
            className="group bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl text-center shadow hover:shadow-lg transition hover:-translate-y-0.5"
          >
            <div className="text-3xl mb-1">📚</div>
            <h3 className="text-lg font-semibold mb-1">ความต้องการของฉัน</h3>
            <p className="text-sm text-white/90">จัดการโพสต์</p>
          </Link>
        </>
      )}

      {/* ปุ่มที่ใช้ร่วมกันทุก role */}
      <Link
        href="/trip-bookings"
        className="group bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white p-6 rounded-xl text-center shadow hover:shadow-lg transition hover:-translate-y-0.5"
      >
        <div className="text-3xl mb-1">🧳</div>
        <h3 className="text-lg font-semibold mb-1">การจองของฉัน</h3>
        <p className="text-sm text-white/90">ดูและจัดการการจอง</p>
      </Link>

      <Link
        href="/profile"
        className="group bg-gradient-to-br from-gray-600 to-gray-700 text-white p-6 rounded-xl text-center shadow hover:shadow-lg transition hover:-translate-y-0.5"
      >
        <div className="text-3xl mb-1">👤</div>
        <h3 className="text-lg font-semibold mb-1">โปรไฟล์</h3>
        <p className="text-sm text-white/90">แก้ไขข้อมูลส่วนตัว</p>
      </Link>
    </div>
  );
}
