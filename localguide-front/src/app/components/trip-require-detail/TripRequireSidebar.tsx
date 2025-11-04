import { TripRequire } from "@/app/types";

interface TripRequireSidebarProps {
  tripRequire: TripRequire;
}

export default function TripRequireSidebar({
  tripRequire,
}: TripRequireSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Trip Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลทริป</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">📍 จังหวัด:</span>
            <span className="font-medium text-right">
              {tripRequire.Province?.Name || "ไม่ระบุ"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">👥 จำนวนคน:</span>
            <span className="font-medium">{tripRequire.GroupSize} คน</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">📅 จำนวนวัน:</span>
            <span className="font-medium">{tripRequire.Days} วัน</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-gray-600">💰 งบประมาณ:</span>
            <span className="font-medium text-right">
              {tripRequire.MinPrice.toLocaleString()}
              <br />- {tripRequire.MaxPrice.toLocaleString()} บาท
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">⭐ Rating ขั้นต่ำ:</span>
            <span className="font-medium">{tripRequire.MinRating} ดาว</span>
          </div>
        </div>
      </div>

      {/* Date Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">วันที่</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">📅 วันเริ่ม:</span>
            <div className="font-medium">
              {new Date(tripRequire.StartDate).toLocaleDateString("th-TH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <div>
            <span className="text-gray-600">📅 วันสิ้นสุด:</span>
            <div className="font-medium">
              {new Date(tripRequire.EndDate).toLocaleDateString("th-TH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <div>
            <span className="text-gray-600">📝 โพสต์เมื่อ:</span>
            <div className="font-medium">
              {new Date(tripRequire.PostedAt).toLocaleDateString("th-TH")}
            </div>
          </div>
          {tripRequire.ExpiresAt && (
            <div>
              <span className="text-gray-600">⏰ หมดอายุ:</span>
              <div className="font-medium">
                {new Date(tripRequire.ExpiresAt).toLocaleDateString("th-TH")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
