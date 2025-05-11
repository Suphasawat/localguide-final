"use client";

import Navbar from "./components/Navbar";
import { useLocale, formatCurrency } from "./context/LocaleContext";

export default function Home() {
  const { currency, language } = useLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <Navbar />

      {/* Search Bar */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center rounded-full border shadow-sm hover:shadow-md p-2 w-full max-w-xl">
          <div className="flex-1 px-4 py-1 text-sm border-r">
            <div className="font-semibold">
              {language === "th" ? "สถานที่" : "Location"}
            </div>
            <div className="text-gray-500">
              {language === "th" ? "ไปที่ไหน?" : "Where to?"}
            </div>
          </div>
          <div className="flex-1 px-4 py-1 text-sm border-r">
            <div className="font-semibold">
              {language === "th" ? "วันที่เช็คอิน" : "Check-in"}
            </div>
            <div className="text-gray-500">
              {language === "th" ? "เพิ่มวันที่" : "Add date"}
            </div>
          </div>
          <div className="flex-1 px-4 py-1 text-sm border-r">
            <div className="font-semibold">
              {language === "th" ? "วันที่เช็คเอาท์" : "Check-out"}
            </div>
            <div className="text-gray-500">
              {language === "th" ? "เพิ่มวันที่" : "Add date"}
            </div>
          </div>
          <div className="flex-1 px-4 py-1 text-sm pr-2">
            <div className="font-semibold">
              {language === "th" ? "ผู้เข้าพัก" : "Guests"}
            </div>
            <div className="text-gray-500">
              {language === "th" ? "เพิ่มผู้เข้าพัก" : "Add guests"}
            </div>
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
          { th: "วิวสวย", en: "Scenic Views" },
          { th: "วิลล่า", en: "Villas" },
          { th: "ชายหาด", en: "Beach" },
          { th: "สระว่ายน้ำ", en: "Swimming Pool" },
          { th: "คอนโด", en: "Condo" },
          { th: "บ้านพัก", en: "House" },
          { th: "รีสอร์ท", en: "Resort" },
          { th: "เมือง", en: "City" },
          { th: "ภูเขา", en: "Mountains" },
          { th: "กระท่อม", en: "Cabins" },
        ].map((category) => (
          <div
            key={category.th}
            className="flex flex-col items-center space-y-2 min-w-fit"
          >
            <div className="h-6 w-6 text-gray-500">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2V7h2v10z" />
              </svg>
            </div>
            <span className="text-xs text-gray-600">
              {language === "th" ? category.th : category.en}
            </span>
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
                <span className="font-semibold">
                  {language === "th" ? "กรุงเทพ, ไทย" : "Bangkok, Thailand"}
                </span>
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
              <p className="text-gray-500">
                {language === "th" ? "ระยะห่าง 32 กม." : "Distance 32 km"}
              </p>
              <p className="text-gray-500">
                {language === "th" ? "วันที่ 10-15 พ.ค." : "May 10-15"}
              </p>
              <p className="mt-1">
                <span className="font-semibold">
                  {formatCurrency(3500, currency)}
                </span>{" "}
                {language === "th" ? "คืน" : "night"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Show Map Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <button className="bg-gray-900 text-white px-4 py-3 rounded-full font-medium flex items-center shadow-lg">
          <span>{language === "th" ? "ดูแผนที่" : "Show map"}</span>
          <svg className="h-5 w-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
