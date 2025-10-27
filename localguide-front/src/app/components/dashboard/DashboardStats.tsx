interface DashboardStatsProps {
  displayName: string;
  dashboardTitle: string;
  totalBookings: number;
  pendingPayments: number;
  totalRequires: number;
  openRequires: number;
  isUser: boolean;
}

export default function DashboardStats({
  displayName,
  dashboardTitle,
  totalBookings,
  pendingPayments,
  totalRequires,
  openRequires,
  isUser,
}: DashboardStatsProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-b-xl">
        <div className="container mx-auto px-4 py-5 sm:py-6 lg:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-emerald-100 text-xs uppercase tracking-wider">
                ยินดีต้อนรับ
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
                สวัสดี, {displayName}
              </h1>
              <p className="mt-1 text-emerald-100 text-sm">{dashboardTitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-white/90">
              <div className="rounded-xl bg-white/10 backdrop-blur p-3">
                <div className="text-[11px]">การจองของฉัน</div>
                <div className="text-xl font-bold">{totalBookings}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur p-3">
                <div className="text-[11px]">รอชำระเงิน</div>
                <div className="text-xl font-bold">{pendingPayments}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur p-3 col-span-1">
                <div className="text-[11px]">ความต้องการ</div>
                <div className="text-xl font-bold">
                  {isUser ? totalRequires : 0}
                </div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur p-3 col-span-1">
                <div className="text-[11px]">เปิดรับ</div>
                <div className="text-xl font-bold">
                  {isUser ? openRequires : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
