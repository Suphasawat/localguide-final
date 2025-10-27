import Link from "next/link";

export default function EmptyTripRequires() {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">🏝️</div>
        <p className="text-gray-500 text-lg mb-4">คุณยังไม่มีความต้องการทริป</p>
        <p className="text-gray-400 text-sm mb-6">
          เริ่มต้นโพสต์ความต้องการทริปแรกของคุณเพื่อให้ไกด์ท้องถิ่นมาเสนอข้อเสนอ
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/user/trip-requires/create"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            โพสต์ความต้องการแรก
          </Link>
          <Link
            href="/dashboard"
            className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            กลับไป Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
