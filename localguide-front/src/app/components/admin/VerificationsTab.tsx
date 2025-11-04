import { GuideVerification } from "../../types/index";
import VerificationCard from "./VerificationCard";

interface VerificationsTabProps {
  verifications: GuideVerification[];
  onApprove: (id: number, status: "approved" | "rejected") => void;
}

export default function VerificationsTab({
  verifications,
  onApprove,
}: VerificationsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">คำขออนุมัติเป็นไกด์</h2>

      {verifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">ไม่มีคำขออนุมัติที่รอพิจารณา</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {verifications.map((verification) => (
            <VerificationCard
              key={verification.ID}
              verification={verification}
              onApprove={onApprove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
