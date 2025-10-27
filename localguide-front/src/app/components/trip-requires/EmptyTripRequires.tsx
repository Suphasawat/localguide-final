import Link from "next/link";

export default function EmptyTripRequires() {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="text-7xl mb-6">🏝️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          คุณยังไม่มีความต้องการทริป
        </h3>
        <p className="text-gray-600 text-sm mb-8">
          เริ่มต้นโพสต์ความต้องการทริปแรกของคุณเพื่อให้ไกด์ท้องถิ่นมาเสนอข้อเสนอ
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/user/trip-requires/create"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full hover:bg-emerald-700 transition-all font-medium shadow-sm"
          >
            <span>+</span>
            <span>โพสต์ความต้องการแรก</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition-all font-medium shadow-sm"
          >
            <span>←</span>
            <span>กลับไป Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
