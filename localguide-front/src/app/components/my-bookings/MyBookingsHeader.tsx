import Link from "next/link";

export default function MyBookingsHeader() {
  return (
    <div className="mb-8">
      {/* Green Header Block */}
      <div className="bg-emerald-600 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm uppercase tracking-wide">
              จัดการทริปของคุณ
            </p>
            <h1 className="text-3xl font-extrabold leading-tight">
              การจองทริป
            </h1>
            <p className="mt-2 text-white/90">
              ดูสถานะการจอง ติดตามความคืบหน้า และดำเนินการชำระเงิน
            </p>
          </div>

          {/* Action Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-full font-semibold shadow-sm hover:bg-emerald-50 transition-all"
          >
            <span>←</span>
            <span>กลับไป Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
