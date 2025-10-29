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
    <>
      {/* ✅ Header สีเขียว */}
      <div className="bg-emerald-600 px-8 py-14 text-white mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold">{title}</h1>
            <p className="mt-3 text-emerald-100">
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
            className={`px-4 py-2 text-sm rounded-full font-semibold shadow-sm ${getStatusColor(
              status
            )}`}
          >
            {getStatusText(status)}
          </span>
        </div>
      </div>
    </>
  );
}
