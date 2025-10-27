interface TripRequire {
  ID: number;
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string;
  EndDate: string;
  Days: number;
  GroupSize: number;
  Province?: { Name: string };
}

interface TripRequireInfoCardProps {
  tripRequire: TripRequire;
  tripStartDate: string;
  tripEndDate: string;
}

export default function TripRequireInfoCard({
  tripRequire,
  tripStartDate,
  tripEndDate,
}: TripRequireInfoCardProps) {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-emerald-800">
        ข้อมูลความต้องการ
      </h2>
      <div className="mt-3 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
        <div>📍 จังหวัด: {tripRequire.Province?.Name || "-"}</div>
        <div>👥 จำนวนคน: {tripRequire.GroupSize} คน</div>
        <div>📅 ระยะเวลา: {tripRequire.Days} วัน</div>
        <div>
          💰 งบประมาณ: {tripRequire.MinPrice.toLocaleString()} -{" "}
          {tripRequire.MaxPrice.toLocaleString()} บาท
        </div>
        <div>🧭 เริ่มทริป: {tripStartDate || "-"}</div>
        <div>🏁 สิ้นสุด: {tripEndDate || "-"}</div>
        <div className="md:col-span-2">
          📝 รายละเอียด: {tripRequire.Description}
        </div>
      </div>
    </div>
  );
}
