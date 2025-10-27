"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { guideAPI, provinceAPI, languageAPI, attractionAPI } from "../lib/api";
import GuideFormFields from "../components/become-guide/GuideFormFields";
import GuideFormNotice from "../components/become-guide/GuideFormNotice";
import GuideFormActions from "../components/become-guide/GuideFormActions";

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

  const isFormValid =
    formData.bio &&
    formData.description &&
    formData.price > 0 &&
    formData.provinceId > 0 &&
    formData.selectedLanguages.length > 0 &&
    formData.selectedAttractions.length > 0;

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
          <GuideFormFields
            formData={formData}
            provinces={provinces}
            languages={languages}
            filteredAttractions={filteredAttractions}
            onFormChange={handleChange}
            onLanguageToggle={handleLanguageToggle}
            onAttractionToggle={handleAttractionToggle}
          />

          <GuideFormNotice />

          <GuideFormActions
            loading={loading}
            isFormValid={!!isFormValid}
            onCancel={() => router.back()}
          />
        </form>
      </div>
    </div>
  );
}
