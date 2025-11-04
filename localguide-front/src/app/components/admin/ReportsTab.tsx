import { TripReport } from "../../types/index";
import ReportCard from "./ReportCard";

interface ReportsTabProps {
  reports: TripReport[];
  onAction: (id: number, action: string) => void;
}

export default function ReportsTab({ reports, onAction }: ReportsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">รายงานปัญหา</h2>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">ไม่มีรายงานปัญหา</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <ReportCard key={report.ID} report={report} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  );
}
