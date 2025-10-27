interface BrowseTripsHeroProps {
  onRefresh: () => void;
}

export default function BrowseTripsHero({ onRefresh }: BrowseTripsHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-emerald-50/90 text-xs uppercase tracking-wider">
                สำหรับไกด์
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white">
                ความต้องการทริป
              </h1>
              <p className="mt-2 text-emerald-50">
                ดูความต้องการเที่ยวจากลูกค้าและเสนอแพ็กเกจของคุณ
              </p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="self-start md:self-auto rounded-full bg-white/90 hover:bg-white text-emerald-700 px-5 py-2 text-sm font-semibold shadow-sm transition"
            >
              รีเฟรชรายการ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
