"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { guideAPI, provinceAPI, languageAPI, attractionAPI } from "../lib/api";
import GuideFormFields from "../components/become-guide/GuideFormFields";
import GuideFormNotice from "../components/become-guide/GuideFormNotice";
import GuideFormActions from "../components/become-guide/GuideFormActions";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>([]);
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
    // ถ้าเป็นไกด์อยู่แล้วให้ไปหน้า browse-trips
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

  // เปลี่ยนรายการสถานที่ตามจังหวัด
  useEffect(() => {
    if (formData.provinceId > 0) {
      const filtered = attractions.filter((a) => a.ProvinceID === formData.provinceId);
      setFilteredAttractions(filtered);
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
      setSuccess("ส่งคำขอสมัครเป็นไกด์เรียบร้อยแล้ว รอการอนุมัติจากผู้ดูแลระบบ");

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error: any) {
      console.error("Failed to create guide application:", error);
      setError(error?.response?.data?.message || "ไม่สามารถส่งคำขอได้");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "provinceId" ? Number(value) : value,
    }));
  };

  const handleLanguageToggle = (languageId: number) => {
    setFormData((prev) => {
      if (prev.selectedLanguages.includes(languageId)) {
        return { ...prev, selectedLanguages: prev.selectedLanguages.filter((id) => id !== languageId) };
      } else {
        return { ...prev, selectedLanguages: [...prev.selectedLanguages, languageId] };
      }
    });
  };

  const handleAttractionToggle = (attractionId: number) => {
    setFormData((prev) => {
      if (prev.selectedAttractions.includes(attractionId)) {
        return { ...prev, selectedAttractions: prev.selectedAttractions.filter((id) => id !== attractionId) };
      } else {
        return { ...prev, selectedAttractions: [...prev.selectedAttractions, attractionId] };
      }
    });
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
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-emerald-800 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

return (
  <>
    <Navbar />

    {/* ✅ Header สีเขียว (จัดให้ตรงกับฟอร์ม) */}
    <div className="bg-emerald-600 text-white pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">
          สำหรับไกด์
        </p>
        <h1 className="mt-1 text-4xl font-extrabold">สมัครเป็นไกด์นำเที่ยว</h1>
        <p className="mt-2 text-emerald-50">
          กรอกข้อมูลเพื่อสมัครเป็นไกด์นำเที่ยวพื้นที่ของคุณ
        </p>
      </div>
    </div>

    {/* ✅ เนื้อหา (ฟอร์ม) */}
    <div className="bg-gray-50 -mt-15 pb-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6"
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

    <Footer />
  </>
);
}