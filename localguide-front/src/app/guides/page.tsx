"use client";

import { useState, useEffect } from "react";
import { Guide, getGuides } from "../services/guide.service";
import GuideCard from "../components/GuideCard";
import { PROVINCES } from "../constants/provinces";

export default function Guides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    province: "",
    minPrice: "",
    maxPrice: "",
    minRating: 0,
  });

  useEffect(() => {
    const loadGuides = async () => {
      try {
        const data = await getGuides();
        setGuides(data);
      } catch (error) {
        console.error("Error loading guides:", error);
        setGuides([]);
      } finally {
        setLoading(false);
      }
    };

    loadGuides();
  }, []);

  const filteredGuides = Array.isArray(guides)
    ? guides.filter((guide) => {
        const matchesSearch =
          filters.search === "" ||
          guide.User.FirstName.toLowerCase().includes(
            filters.search.toLowerCase()
          ) ||
          guide.User.LastName.toLowerCase().includes(
            filters.search.toLowerCase()
          ) ||
          guide.Province.toLowerCase().includes(filters.search.toLowerCase());

        const matchesProvince =
          filters.province === "" || guide.Province === filters.province;

        const matchesPrice =
          (filters.minPrice === "" ||
            guide.Price >= Number(filters.minPrice)) &&
          (filters.maxPrice === "" || guide.Price <= Number(filters.maxPrice));

        const matchesRating = guide.Rating >= filters.minRating;

        return (
          matchesSearch && matchesProvince && matchesPrice && matchesRating
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ค้นหาไกด์ท้องถิ่น
          </h1>
          <p className="text-xl md:text-2xl text-amber-100 mb-6">
            พบกับไกด์มืออาชีพที่จะพาคุณสำรวจความงามของท้องถิ่น
          </p>
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
            <svg
              className="w-6 h-6 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span>พร้อมให้บริการทั่วประเทศไทย</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-amber-100 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              ตัวกรองการค้นหา
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ค้นหาไกด์
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10 block w-full rounded-xl border-2 border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 py-3 text-black"
                  style={{ color: "#000" }}
                  placeholder="ชื่อไกด์ หรือ จังหวัด"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                จังหวัด
              </label>
              <div className="relative">
                <select
                  value={filters.province}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      province: e.target.value,
                    }))
                  }
                  className="appearance-none block w-full rounded-xl border-2 border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 py-3 px-4 pr-10 text-black"
                  style={{ color: "#000" }}
                >
                  <option value="">ทุกจังหวัด</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ราคา (บาท/วัน)
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">฿</span>
                  </div>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: e.target.value,
                      }))
                    }
                    className="pl-8 block w-full rounded-xl border-2 border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 py-3 text-black"
                    style={{ color: "#000" }}
                    placeholder="ต่ำสุด"
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">-</span>
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">฿</span>
                  </div>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: e.target.value,
                      }))
                    }
                    className="pl-8 block w-full rounded-xl border-2 border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 py-3 text-black"
                    style={{ color: "#000" }}
                    placeholder="สูงสุด"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                คะแนนขั้นต่ำ
              </label>
              <div className="relative">
                <select
                  value={filters.minRating}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minRating: Number(e.target.value),
                    }))
                  }
                  className="appearance-none block w-full rounded-xl border-2 border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 py-3 px-4 pr-10 text-black"
                  style={{ color: "#000" }}
                >
                  <option value={0}>ทุกคะแนน</option>
                  <option value={3}>⭐ 3+ ดาว</option>
                  <option value={4}>⭐ 4+ ดาว</option>
                  <option value={4.5}>⭐ 4.5+ ดาว</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  province: "",
                  minPrice: "",
                  maxPrice: "",
                  minRating: 0,
                })
              }
              className="px-4 py-2 bg-white/50 text-gray-700 rounded-full border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 text-sm font-medium"
            >
              ล้างตัวกรอง
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, minRating: 4 }))}
              className="px-4 py-2 bg-white/50 text-gray-700 rounded-full border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 text-sm font-medium"
            >
              ⭐ ไกด์คุณภาพสูง
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, maxPrice: "2000" }))
              }
              className="px-4 py-2 bg-white/50 text-gray-700 rounded-full border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 text-sm font-medium"
            >
              💰 ราคาประหยัด
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-amber-100 p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">
                  กำลังค้นหาไกด์ท้องถิ่น...
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    พบ {filteredGuides.length} รายการ
                  </h3>
                </div>
                <div className="text-sm text-gray-500">เรียงตามความนิยม</div>
              </div>

              {filteredGuides.length === 0 ? (
                <div className="text-center py-16">
                  <svg
                    className="mx-auto h-24 w-24 text-gray-300 mb-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ไม่พบไกด์ท้องถิ่น
                  </h3>
                  <p className="text-gray-500 mb-6">
                    ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรองของคุณ
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        search: "",
                        province: "",
                        minPrice: "",
                        maxPrice: "",
                        minRating: 0,
                      })
                    }
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    ล้างตัวกรอง
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGuides.map((guide) => (
                    <GuideCard key={guide.ID} guide={guide} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
