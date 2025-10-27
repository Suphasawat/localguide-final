interface OffersFilterControlsProps {
  statusFilter:
    | "all"
    | "sent"
    | "accepted"
    | "rejected"
    | "expired"
    | "withdrawn";
  setStatusFilter: (
    filter: "all" | "sent" | "accepted" | "rejected" | "expired" | "withdrawn"
  ) => void;
  sortBy: "latest" | "price_low" | "price_high" | "rating_high";
  setSortBy: (
    sort: "latest" | "price_low" | "price_high" | "rating_high"
  ) => void;
  filteredCount: number;
  totalCount: number;
  counts: {
    sent: number;
    accepted: number;
    rejected: number;
    expired: number;
    withdrawn: number;
  };
}

export default function OffersFilterControls({
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  filteredCount,
  totalCount,
  counts,
}: OffersFilterControlsProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <h3 className="text-lg font-semibold text-gray-900">
        ข้อเสนอทั้งหมด ({filteredCount} จาก {totalCount})
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: "all", label: "ทั้งหมด", count: totalCount },
            {
              key: "sent",
              label: "รอการตอบรับ",
              count: counts.sent,
            },
            {
              key: "accepted",
              label: "ยอมรับแล้ว",
              count: counts.accepted,
            },
            {
              key: "rejected",
              label: "ปฏิเสธแล้ว",
              count: counts.rejected,
            },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key as any)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              statusFilter === f.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {f.label} <span className="ml-1 opacity-80">({f.count})</span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-gray-600">เรียงตาม</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
          >
            <option value="latest">วันที่ส่งล่าสุด</option>
            <option value="price_low">ราคาต่ำสุด</option>
            <option value="price_high">ราคาสูงสุด</option>
            <option value="rating_high">เรตติ้งไกด์สูงสุด</option>
          </select>
        </div>
      </div>
    </div>
  );
}
