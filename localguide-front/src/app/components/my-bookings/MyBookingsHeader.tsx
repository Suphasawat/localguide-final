import Link from "next/link";

export default function MyBookingsHeader() {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">การจองทริป</h1>
        <p className="mt-2 text-gray-600">ดูและจัดการการจองทริปของคุณ</p>
      </div>
      <Link
        href="/dashboard"
        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
      >
        ← กลับไป Dashboard
      </Link>
    </div>
  );
}
