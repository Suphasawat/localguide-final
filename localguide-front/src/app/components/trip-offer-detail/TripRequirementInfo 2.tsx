interface TripRequire {
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string;
  EndDate: string;
  Days: number;
  GroupSize: number;
  Province?: { Name: string };
  User: {
    FirstName: string;
    LastName: string;
    Email: string;
  };
}

interface TripRequirementInfoProps {
  tripRequire: TripRequire;
}

export default function TripRequirementInfo({
  tripRequire,
}: TripRequirementInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">ความต้องการของลูกค้า</h2>
      <div className="space-y-3">
        <div>
          <span className="text-gray-600">ชื่อทริป:</span>{" "}
          <span className="font-medium">{tripRequire.Title}</span>
        </div>
        <div>
          <span className="text-gray-600">ลูกค้า:</span>{" "}
          <span className="font-medium">
            {tripRequire.User.FirstName} {tripRequire.User.LastName}
          </span>
        </div>
        <div>
          <span className="text-gray-600">อีเมล:</span>{" "}
          <span className="font-medium">{tripRequire.User.Email}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div>📍 จังหวัด: {tripRequire.Province?.Name || "-"}</div>
          <div>👥 จำนวนคน: {tripRequire.GroupSize} คน</div>
          <div>📅 ระยะเวลา: {tripRequire.Days} วัน</div>
          <div>
            💰 งบประมาณ: {tripRequire.MinPrice.toLocaleString()} -{" "}
            {tripRequire.MaxPrice.toLocaleString()} บาท
          </div>
          <div>
            🧭 เริ่ม:{" "}
            {new Date(tripRequire.StartDate).toLocaleDateString("th-TH")}
          </div>
          <div>
            🏁 สิ้นสุด:{" "}
            {new Date(tripRequire.EndDate).toLocaleDateString("th-TH")}
          </div>
        </div>
        <div className="pt-2">
          <span className="text-gray-600">รายละเอียด:</span>
          <p className="mt-1 text-gray-700">{tripRequire.Description}</p>
        </div>
      </div>
    </div>
  );
}
