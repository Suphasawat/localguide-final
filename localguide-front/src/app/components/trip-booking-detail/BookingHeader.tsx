interface BookingHeaderProps {
  bookingId: number;
  onBack: () => void;
}

export default function BookingHeader({
  bookingId,
  onBack,
}: BookingHeaderProps) {
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← กลับ
      </button>
      <h1 className="text-3xl font-bold text-gray-900">รายละเอียดการจอง</h1>
      <p className="mt-2 text-gray-600">หมายเลขการจอง: #{bookingId}</p>
    </div>
  );
}
