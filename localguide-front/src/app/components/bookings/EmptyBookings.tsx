import Link from "next/link";

interface EmptyBookingsProps {
  hasBookings: boolean;
  userRole?: number;
}

export default function EmptyBookings({
  hasBookings,
  userRole,
}: EmptyBookingsProps) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">📋</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีการจอง</h3>
      <p className="text-gray-500 mb-4">
        {!hasBookings
          ? "คุณยังไม่มีการจองทริปใดๆ"
          : "ไม่มีการจองที่ตรงกับตัวกรองที่เลือก"}
      </p>
      {userRole === 1 && !hasBookings && (
        <Link
          href="/user/trip-requires/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          สร้างความต้องการเที่ยวใหม่
        </Link>
      )}
    </div>
  );
}
