import { TripReport } from "../../types/index";

interface ReportCardProps {
  report: TripReport;
  onAction: (id: number, action: string) => void;
}

export default function ReportCard({ report, onAction }: ReportCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{report.Title}</h3>
          <p className="text-gray-600">ประเภท: {report.ReportType}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            report.Severity === "critical"
              ? "bg-red-100 text-red-800"
              : report.Severity === "high"
              ? "bg-orange-100 text-orange-800"
              : report.Severity === "medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {report.Severity}
        </span>
      </div>

      <div className="mb-4 text-sm space-y-2">
        <div>
          👤 ผู้รายงาน: {report.Reporter?.FirstName} {report.Reporter?.LastName}
        </div>
        <div>
          🎯 ผู้ถูกรายงาน: {report.ReportedUser?.FirstName}{" "}
          {report.ReportedUser?.LastName}
        </div>
        <div className="mt-3">📝 {report.Description}</div>
      </div>

      {report.Status === "pending" && (
        <div className="flex space-x-3">
          <button
            onClick={() => onAction(report.ID, "investigating")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            เริ่มสอบสวน
          </button>
          <button
            onClick={() => onAction(report.ID, "resolved")}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            แก้ไขแล้ว
          </button>
          <button
            onClick={() => onAction(report.ID, "dismissed")}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      )}
    </div>
  );
}
