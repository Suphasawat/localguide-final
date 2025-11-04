interface BookingsFiltersProps {
  filter: {
    status: string;
    paymentStatus: string;
  };
  onFilterChange: (filter: { status: string; paymentStatus: string }) => void;
}

export default function BookingsFilters({
  filter,
  onFilterChange,
}: BookingsFiltersProps) {
  const handleClearFilters = () => {
    onFilterChange({ status: "", paymentStatus: "" });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">ตัวกรอง</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            สถานะการจอง
          </label>
          <select
            value={filter.status}
            onChange={(e) =>
              onFilterChange({ ...filter, status: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทั้งหมด</option>
            <option value="pending_payment">รอชำระเงิน</option>
            <option value="paid">ชำระแล้ว</option>
            <option value="trip_started">เริ่มทริปแล้ว</option>
            <option value="trip_completed">เสร็จสิ้น</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            สถานะการชำระเงิน
          </label>
          <select
            value={filter.paymentStatus}
            onChange={(e) =>
              onFilterChange({ ...filter, paymentStatus: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทั้งหมด</option>
            <option value="pending">รอชำระ</option>
            <option value="paid">ชำระแล้ว</option>
            <option value="first_released">จ่ายครั้งแรกแล้ว</option>
            <option value="fully_released">จ่ายครบแล้ว</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </div>
    </div>
  );
}
