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
    <section className="relative overflow-hidden bg-emerald-600">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-white">
            <p className="text-white/80 text-sm uppercase tracking-wider font-medium">
              ยินดีต้อนรับ
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">
              สวัสดี, {displayName}
            </h1>
            <p className="mt-3 text-white/90 text-lg">{dashboardTitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4 sm:p-5 hover:bg-white/20 transition">
              <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                การจองของฉัน
              </div>
              <div className="mt-2 text-3xl font-bold text-white">
                {totalBookings}
              </div>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4 sm:p-5 hover:bg-white/20 transition">
              <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                รอชำระเงิน
              </div>
              <div className="mt-2 text-3xl font-bold text-white">
                {pendingPayments}
              </div>
            </div>
            {isUser && (
              <>
                <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4 sm:p-5 hover:bg-white/20 transition">
                  <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                    ความต้องการ
                  </div>
                  <div className="mt-2 text-3xl font-bold text-white">
                    {totalRequires}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4 sm:p-5 hover:bg-white/20 transition">
                  <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                    เปิดรับ
                  </div>
                  <div className="mt-2 text-3xl font-bold text-white">
                    {openRequires}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
