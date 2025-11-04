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
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            report.Status === "resolved"
              ? "bg-emerald-100 text-emerald-800"
              : report.Status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : report.Status === "in_review"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {report.Status === "resolved"
            ? "ตัดสินแล้ว"
            : report.Status === "pending"
            ? "รอดำเนินการ"
            : report.Status === "in_review"
            ? "กำลังตรวจสอบ"
            : "ไม่ทราบสถานะ"}
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
    </div>
  );
}
