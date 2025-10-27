import { GuideVerification } from "../../types/index";

interface VerificationCardProps {
  verification: GuideVerification;
  onApprove: (id: number, status: "approved" | "rejected") => void;
}

export default function VerificationCard({
  verification,
  onApprove,
}: VerificationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {verification.User?.FirstName} {verification.User?.LastName}
          </h3>
          <p className="text-gray-600">{verification.User?.Email}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            verification.Status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : verification.Status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {verification.Status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>📍 {verification.Province?.Name}</div>
        <div>💰 ราคา: {verification.Price?.toLocaleString()} บาท/วัน</div>
        <div className="md:col-span-2">📝 {verification.Bio}</div>
        <div className="md:col-span-2">📋 {verification.Description}</div>
      </div>

      {verification.Status === "pending" && (
        <div className="flex space-x-3">
          <button
            onClick={() => onApprove(verification.ID, "approved")}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            อนุมัติ
          </button>
          <button
            onClick={() => onApprove(verification.ID, "rejected")}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            ปฏิเสธ
          </button>
        </div>
      )}
    </div>
  );
}
