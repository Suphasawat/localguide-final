interface TripRequiresHeaderProps {
  tripRequiresCount: number;
  openCount: number;
  totalOffers: number;
}

export default function TripRequiresHeader({
  tripRequiresCount,
  openCount,
  totalOffers,
}: TripRequiresHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        ความต้องการทริปของฉัน
      </h1>
      <p className="mt-2 text-gray-600">
        จัดการความต้องการทริปและดูข้อเสนอที่ได้รับ
      </p>
      {tripRequiresCount > 0 && (
        <div className="mt-2 flex space-x-4 text-sm text-gray-500">
          <span>📝 ทั้งหมด {tripRequiresCount} รายการ</span>
          <span>💼 เปิดรับ {openCount} รายการ</span>
          <span>📩 รวมข้อเสนอ {totalOffers} รายการ</span>
        </div>
      )}
    </div>
  );
}
