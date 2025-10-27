interface OfferHeaderProps {
  title: string;
  sentAt: string;
  status: string;
  onBack: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export default function OfferHeader({
  title,
  sentAt,
  status,
  onBack,
  getStatusColor,
  getStatusText,
}: OfferHeaderProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← กลับไปรายการข้อเสนอ
      </button>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-600">
            ส่งเมื่อ:{" "}
            {new Date(sentAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`px-4 py-2 text-sm rounded-full ${getStatusColor(status)}`}
        >
          {getStatusText(status)}
        </span>
      </div>
    </div>
  );
}
