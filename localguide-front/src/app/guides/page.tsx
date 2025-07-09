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
        setGuides(Array.isArray(data) ? data : []);
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
          guide.user.firstName
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          guide.user.lastName
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          guide.province.toLowerCase().includes(filters.search.toLowerCase());

        const matchesProvince =
          filters.province === "" || guide.province === filters.province;

        const matchesPrice =
          (filters.minPrice === "" ||
            guide.price >= Number(filters.minPrice)) &&
          (filters.maxPrice === "" || guide.price <= Number(filters.maxPrice));

        const matchesRating = guide.rating >= filters.minRating;

        return (
          matchesSearch && matchesProvince && matchesPrice && matchesRating
        );
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">ตัวกรอง</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ค้นหา
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="ชื่อ หรือ จังหวัด"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              จังหวัด
            </label>
            <select
              value={filters.province}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, province: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="">ทั้งหมด</option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              ราคา (บาท/วัน)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="ต่ำสุด"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="สูงสุด"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              คะแนนขั้นต่ำ
            </label>
            <select
              value={filters.minRating}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minRating: Number(e.target.value),
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value={0}>ทั้งหมด</option>
              <option value={3}>3 ดาวขึ้นไป</option>
              <option value={4}>4 ดาวขึ้นไป</option>
              <option value={4.5}>4.5 ดาวขึ้นไป</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-gray-600">
            พบ {filteredGuides.length} รายการ
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
