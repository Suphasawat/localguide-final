"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { guideAPI, provinceAPI, languageAPI, attractionAPI } from "../lib/api";

interface Province {
  ID: number;
  Name: string;
}

interface Language {
  ID: number;
  Name: string;
}

interface Attraction {
  ID: number;
  Name: string;
  ProvinceID: number;
}

export default function BecomeGuidePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    bio: "",
    description: "",
    price: 0,
    provinceId: 0,
    selectedLanguages: [] as number[],
    selectedAttractions: [] as number[],
    certificationNumber: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Check if user is already a guide
    if (user?.role === 2) {
      router.push("/guide/browse-trips");
      return;
    }

    loadAllData();
  }, [user, isAuthenticated, router]);

  const loadAllData = async () => {
    try {
      const [provincesRes, languagesRes, attractionsRes] = await Promise.all([
        provinceAPI.getAll(),
        languageAPI.getAll(),
        attractionAPI.getAll(),
      ]);

      setProvinces(provincesRes.data?.provinces || []);
      setLanguages(languagesRes.data?.languages || []);
      setAttractions(attractionsRes.data?.attractions || []);
      setFilteredAttractions(attractionsRes.data?.attractions || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Filter attractions when province changes
  useEffect(() => {
    if (formData.provinceId > 0) {
      const filtered = attractions.filter(
        (attraction) => attraction.ProvinceID === formData.provinceId
      );
      setFilteredAttractions(filtered);
      // Clear selected attractions when province changes
      setFormData((prev) => ({ ...prev, selectedAttractions: [] }));
    } else {
      setFilteredAttractions(attractions);
    }
  }, [formData.provinceId, attractions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const guideData = {
        bio: formData.bio,
        description: formData.description,
        price: formData.price,
        provinceId: formData.provinceId,
        languageIds: formData.selectedLanguages,
        attractionIds: formData.selectedAttractions,
        certificationNumber: formData.certificationNumber,
      };

      await guideAPI.create(guideData);
      setSuccess(
        "ส่งคำขอสมัครเป็นไกด์เรียบร้อยแล้ว รอการอนุมัติจากผู้ดูแลระบบ"
      );

      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error: any) {
      console.error("Failed to create guide application:", error);
      setError(error.response?.data?.message || "ไม่สามารถส่งคำขอได้");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "provinceId" ? Number(value) : value,
    }));
  };

  const handleLanguageToggle = (languageId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedLanguages: prev.selectedLanguages.includes(languageId)
        ? prev.selectedLanguages.filter((id) => id !== languageId)
        : [...prev.selectedLanguages, languageId],
    }));
  };

  const handleAttractionToggle = (attractionId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedAttractions: prev.selectedAttractions.includes(attractionId)
        ? prev.selectedAttractions.filter((id) => id !== attractionId)
        : [...prev.selectedAttractions, attractionId],
    }));
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            สมัครเป็นไกด์นำเที่ยว
          </h1>
          <p className="mt-2 text-gray-600">
            กรอกข้อมูลเพื่อสมัครเป็นไกด์นำเที่ยวพื้นที่ของคุณ
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              แนะนำตัว (Bio) *
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="แนะนำตัวสั้นๆ เช่น ไกด์ผู้เชี่ยวชาญการท่องเที่ยวภาคเหนือ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียดการให้บริการ *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="อธิบายรายละเอียดการให้บริการ เช่น สถานที่ที่เชี่ยวชาญ ประสบการณ์ การบริการ..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาค่าบริการ (บาท/วัน) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จังหวัด *
              </label>
              <select
                name="provinceId"
                value={formData.provinceId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">เลือกจังหวัด</option>
                {provinces.map((province) => (
                  <option key={province.ID} value={province.ID}>
                    {province.Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ภาษาที่สามารถใช้ได้ *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
              {languages.map((language) => (
                <label
                  key={language.ID}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedLanguages.includes(language.ID)}
                    onChange={() => handleLanguageToggle(language.ID)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{language.Name}</span>
                </label>
              ))}
            </div>
            {formData.selectedLanguages.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                กรุณาเลือกภาษาอย่างน้อย 1 ภาษา
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานที่ท่องเที่ยวที่เชี่ยวชาญ *
            </label>
            {formData.provinceId === 0 && (
              <p className="text-sm text-gray-500 mb-2">
                กรุณาเลือกจังหวัดก่อนเพื่อดูสถานที่ท่องเที่ยว
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
              {filteredAttractions.map((attraction) => (
                <label
                  key={attraction.ID}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedAttractions.includes(
                      attraction.ID
                    )}
                    onChange={() => handleAttractionToggle(attraction.ID)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{attraction.Name}</span>
                </label>
              ))}
            </div>
            {filteredAttractions.length === 0 && formData.provinceId > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                ไม่มีสถานที่ท่องเที่ยวในจังหวัดนี้
              </p>
            )}
            {formData.selectedAttractions.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                กรุณาเลือกสถานที่ท่องเที่ยวอย่างน้อย 1 แห่ง
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเลขใบอนุญาตไกด์ (ถ้ามี)
            </label>
            <input
              type="text"
              name="certificationNumber"
              value={formData.certificationNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="GD-2024-001234"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  หมายเหตุ
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    คำขอจะต้องผ่านการอนุมัติจากผู้ดูแลระบบก่อน
                    คุณจะได้รับการแจ้งเตือนผ่านอีเมลเมื่อมีการอัปเดตสถานะ
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !formData.bio ||
                !formData.description ||
                formData.price <= 0 ||
                formData.provinceId === 0 ||
                formData.selectedLanguages.length === 0 ||
                formData.selectedAttractions.length === 0
              }
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "กำลังส่ง..." : "ส่งคำขอ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
