interface BookingHeaderProps {
  bookingId: number;
  onBack: () => void;
}

export default function BookingHeader({
  bookingId,
  onBack,
}: BookingHeaderProps) {
  return (
    <div className="bg-emerald-600 text-white rounded-b-2xl shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Left Section */}
        <div>
          <p className="text-white/80 text-sm uppercase tracking-wide">
            รายละเอียดการจอง
          </p>
          <h1 className="text-3xl font-extrabold leading-tight">
            หมายเลขการจอง {bookingId}
          </h1>
          <p className="mt-1 text-white/90 text-sm">
            ตรวจสอบสถานะ ชำระเงิน และข้อมูลการเดินทาง
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-full font-semibold shadow-sm hover:bg-emerald-50 transition-all"
        >
          ← กลับ
        </button>
      </div>
    </div>
  );
}
