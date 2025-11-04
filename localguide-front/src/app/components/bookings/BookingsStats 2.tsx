import { TripBooking } from "@/app/types";

interface BookingsStatsProps {
  bookings: TripBooking[];
}

export default function BookingsStats({ bookings }: BookingsStatsProps) {
  const pendingPaymentCount = bookings.filter(
    (b) => b.Status === "pending_payment"
  ).length;

  const activeCount = bookings.filter(
    (b) => b.Status === "paid" || b.Status === "trip_started"
  ).length;

  const completedCount = bookings.filter(
    (b) => b.Status === "trip_completed"
  ).length;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">สรุปข้อมูล</h3>
      <div className="grid md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-yellow-600">
            {pendingPaymentCount}
          </div>
          <div className="text-sm text-gray-600">รอชำระเงิน</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
          <div className="text-sm text-gray-600">กำลังดำเนินการ</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {completedCount}
          </div>
          <div className="text-sm text-gray-600">เสร็จสิ้น</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-600">
            {bookings.length}
          </div>
          <div className="text-sm text-gray-600">ทั้งหมด</div>
        </div>
      </div>
    </div>
  );
}
