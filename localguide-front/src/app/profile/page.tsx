"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { userAPI } from "../lib/api";
import Navbar from "../components/Navbar";

interface UserProfile {
  ID: number;
  FirstName: string;
  LastName: string;
  Nickname: string;
  BirthDate: string;
  Phone: string;
  Nationality: string;
  Sex: string;
  Avatar: string;
  AuthUser: {
    Email: string;
  };
  Role: {
    Name: string;
  };
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    birthDate: "",
    phone: "",
    nationality: "",
    sex: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    loadProfile();
  }, [isAuthenticated, router]);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.user);
      setFormData({
        firstName: response.data.user.FirstName || "",
        lastName: response.data.user.LastName || "",
        nickname: response.data.user.Nickname || "",
        birthDate: response.data.user.BirthDate
          ? response.data.user.BirthDate.split("T")[0]
          : "",
        phone: response.data.user.Phone || "",
        nationality: response.data.user.Nationality || "",
        sex: response.data.user.Sex || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await userAPI.updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        nickname: formData.nickname,
        birth_date: formData.birthDate,
        phone: formData.phone,
        nationality: formData.nationality,
        sex: formData.sex,
      });

      setSuccess("บันทึกข้อมูลเรียบร้อยแล้ว");
      setEditing(false);
      loadProfile(); // Reload profile data
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      setError(error.response?.data?.error || "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">โปรไฟล์ของฉัน</h1>
          <p className="mt-2 text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
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

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                {profile?.Avatar ? (
                  <img
                    src={profile.Avatar}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 text-2xl font-bold">
                    {profile?.FirstName?.charAt(0) ||
                      profile?.AuthUser?.Email?.charAt(0) ||
                      "U"}
                  </span>
                )}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {profile?.FirstName || profile?.LastName
                    ? `${profile.FirstName} ${profile.LastName}`
                    : profile?.Nickname || "ผู้ใช้งาน"}
                </h2>
                <p className="text-blue-100">{profile?.AuthUser?.Email}</p>
                <p className="text-blue-100">
                  {profile?.Role?.Name === "user"
                    ? "นักท่องเที่ยว"
                    : profile?.Role?.Name === "guide"
                    ? "ไกด์ท่องเที่ยว"
                    : profile?.Role?.Name === "admin"
                    ? "ผู้ดูแลระบบ"
                    : "ผู้ใช้งาน"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                ข้อมูลส่วนตัว
              </h3>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  แก้ไขข้อมูล
                </button>
              ) : (
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setError("");
                      setSuccess("");
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "กำลังบันทึก..." : "บันทึก"}
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อจริง
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="กรอกชื่อจริง"
                  />
                ) : (
                  <p className="py-2 text-gray-900">
                    {profile?.FirstName || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  นามสกุล
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="กรอกนามสกุล"
                  />
                ) : (
                  <p className="py-2 text-gray-900">
                    {profile?.LastName || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อเล่น
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="กรอกชื่อเล่น"
                  />
                ) : (
                  <p className="py-2 text-gray-900">
                    {profile?.Nickname || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันเกิด
                </label>
                {editing ? (
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="py-2 text-gray-900">
                    {profile?.BirthDate
                      ? new Date(profile.BirthDate).toLocaleDateString("th-TH")
                      : "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="กรอกเบอร์โทรศัพท์"
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profile?.Phone || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สัญชาติ
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="กรอกสัญชาติ"
                  />
                ) : (
                  <p className="py-2 text-gray-900">
                    {profile?.Nationality || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เพศ
                </label>
                {editing ? (
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="Male">ชาย</option>
                    <option value="Female">หญิง</option>
                    <option value="Other">อื่นๆ</option>
                  </select>
                ) : (
                  <p className="py-2 text-gray-900">
                    {profile?.Sex === "Male"
                      ? "ชาย"
                      : profile?.Sex === "Female"
                      ? "หญิง"
                      : profile?.Sex === "Other"
                      ? "อื่นๆ"
                      : "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <p className="py-2 text-gray-900">
                  {profile?.AuthUser?.Email || "-"}
                </p>
                <p className="text-xs text-gray-500">ไม่สามารถแก้ไขอีเมลได้</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                การดำเนินการ
              </h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/auth/reset-password")}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  เปลี่ยนรหัสผ่าน
                </button>

                {user?.role === 1 && (
                  <button
                    onClick={() => router.push("/become-guide")}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    สมัครเป็นไกด์
                  </button>
                )}

                {user?.role === 2 && (
                  <button
                    onClick={() => router.push("/guide/my-offers")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    จัดการข้อเสนอ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
