"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAxios } from "../../services/auth.service";
import { PROVINCES } from "../../constants/provinces";

export default function GuideRegister() {
  const [form, setForm] = useState({
    bio: "",
    experience: "",
    district: "",
    city: "",
    province: "",
    price: "",
    languages: [] as string[],
    touristAttractions: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const availableLanguages = [
    "ภาษาไทย",
    "English",
    "中文",
    "日本語",
    "한국어",
    "Français",
    "Deutsch",
    "Español",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (language: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleAttractionChange = (index: number, value: string) => {
    setForm((prev) => {
      const newAttractions = [...prev.touristAttractions];
      newAttractions[index] = value;
      return { ...prev, touristAttractions: newAttractions };
    });
  };

  const addAttraction = () => {
    setForm((prev) => ({
      ...prev,
      touristAttractions: [...prev.touristAttractions, ""],
    }));
  };

  const removeAttraction = (index: number) => {
    setForm((prev) => ({
      ...prev,
      touristAttractions: prev.touristAttractions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAxios.post("/guides", {
        ...form,
        price: Number(form.price),
        touristAttractions: form.touristAttractions.filter(
          (attr) => attr.trim() !== ""
        ),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการสมัคร");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-white to-orange-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-amber-100 max-w-md w-full text-center">
          <div className="text-green-600 mb-4">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            สมัครสำเร็จ!
          </h1>
          <p className="text-gray-600">
            ข้อมูลของคุณกำลังรอการตรวจสอบจากแอดมิน
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-white to-orange-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-amber-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-700">
              สมัครเป็นไกด์ท้องถิ่น
            </h1>
            <p className="text-gray-600 mt-2">
              แบ่งปันความรู้และประสบการณ์ของคุณกับนักท่องเที่ยว
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                แนะนำตัว *
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                required
                rows={4}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition text-black"
                style={{ color: "#000" }}
                placeholder="เล่าเกี่ยวกับตัวคุณ ความชอบ และสิ่งที่ทำให้คุณเป็นไกด์ที่ดี"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                ประสบการณ์ *
              </label>
              <textarea
                name="experience"
                value={form.experience}
                onChange={handleChange}
                required
                rows={4}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition text-black"
                style={{ color: "#000" }}
                placeholder="ประสบการณ์การเป็นไกด์ หรือความรู้เกี่ยวกับพื้นที่"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  จังหวัด *
                </label>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition text-black"
                  style={{ color: "#000" }}
                >
                  <option value="">เลือกจังหวัด</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  อำเภอ/เขต *
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition text-black"
                  style={{ color: "#000" }}
                  placeholder="อำเภอ/เขต"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  ตำบล/แขวง
                </label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition text-black"
                  style={{ color: "#000" }}
                  placeholder="ตำบล/แขวง"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                อัตราค่าบริการ (บาท/วัน) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="100"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition text-black"
                style={{ color: "#000" }}
                placeholder="เช่น 1500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                ภาษาที่สามารถสื่อสารได้ *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableLanguages.map((language) => (
                  <label key={language} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.languages.includes(language)}
                      onChange={() => handleLanguageChange(language)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-black">{language}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                สถานที่ท่องเที่ยวที่แนะนำ
              </label>
              {form.touristAttractions.map((attraction, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={attraction}
                    onChange={(e) =>
                      handleAttractionChange(index, e.target.value)
                    }
                    className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition text-black"
                    style={{ color: "#000" }}
                    placeholder="ชื่อสถานที่ท่องเที่ยว"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttraction(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    ลบ
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAttraction}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                เพิ่มสถานที่
              </button>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || form.languages.length === 0}
                className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition shadow disabled:opacity-50"
              >
                {loading ? "กำลังส่งใบสมัคร..." : "ส่งใบสมัคร"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
