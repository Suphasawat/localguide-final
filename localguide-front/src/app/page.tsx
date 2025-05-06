export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="py-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <svg
            className="h-8 w-8 text-rose-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2V7h2v10z"></path>
          </svg>
          <span className="ml-2 text-xl font-bold text-rose-500">
            localguide
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 rounded-full border border-gray-200 hover:shadow-md transition">
            ให้เช่าที่พัก
          </button>
          <div className="flex items-center space-x-2 p-2 rounded-full border border-gray-200 hover:shadow-md transition">
            <svg
              className="h-5 w-5 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <div className="h-8 w-8 bg-gray-500 rounded-full flex items-center justify-center text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center rounded-full border shadow-sm hover:shadow-md p-2 w-full max-w-xl">
          <div className="flex-1 px-4 py-1 text-sm border-r">
            <div className="font-semibold">สถานที่</div>
            <div className="text-gray-500">ไปที่ไหน?</div>
          </div>
          <div className="flex-1 px-4 py-1 text-sm border-r">
            <div className="font-semibold">วันที่เช็คอิน</div>
            <div className="text-gray-500">เพิ่มวันที่</div>
          </div>
          <div className="flex-1 px-4 py-1 text-sm border-r">
            <div className="font-semibold">วันที่เช็คเอาท์</div>
            <div className="text-gray-500">เพิ่มวันที่</div>
          </div>
          <div className="flex-1 px-4 py-1 text-sm pr-2">
            <div className="font-semibold">ผู้เข้าพัก</div>
            <div className="text-gray-500">เพิ่มผู้เข้าพัก</div>
          </div>
          <button className="bg-rose-500 text-white p-2 rounded-full">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mt-6 flex space-x-8 overflow-x-auto pb-4 scrollbar-hide">
        {[
          "วิวสวย",
          "วิลล่า",
          "ชายหาด",
          "สระว่ายน้ำ",
          "คอนโด",
          "บ้านพัก",
          "รีสอร์ท",
          "เมือง",
          "ภูเขา",
          "กระท่อม",
        ].map((category) => (
          <div
            key={category}
            className="flex flex-col items-center space-y-2 min-w-fit"
          >
            <div className="h-6 w-6 text-gray-500">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2V7h2v10z" />
              </svg>
            </div>
            <span className="text-xs text-gray-600">{category}</span>
          </div>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="rounded-xl overflow-hidden">
            <div className="relative pb-[66.666%]">
              <div className="absolute inset-0 bg-gray-200 rounded-xl"></div>
              <button className="absolute top-2 right-2 text-white">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-2">
              <div className="flex justify-between">
                <span className="font-semibold">กรุงเทพ, ไทย</span>
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 text-gray-900"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="ml-1">4.95</span>
                </div>
              </div>
              <p className="text-gray-500">ระยะห่าง 32 กม.</p>
              <p className="text-gray-500">วันที่ 10-15 พ.ค.</p>
              <p className="mt-1">
                <span className="font-semibold">฿3,500</span> คืน
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Show Map Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <button className="bg-gray-900 text-white px-4 py-3 rounded-full font-medium flex items-center shadow-lg">
          <span>ดูแผนที่</span>
          <svg className="h-5 w-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
