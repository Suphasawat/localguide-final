"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { userAPI } from "../lib/api";
import Navbar from "../components/Navbar";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileForm from "../components/profile/ProfileForm";
import QuickActions from "../components/profile/QuickActions";

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
          {profile && <ProfileHeader profile={profile} />}

          {/* Profile Form */}
          {profile && (
            <ProfileForm
              profile={profile}
              editing={editing}
              saving={saving}
              formData={formData}
              onEdit={() => setEditing(true)}
              onCancel={() => {
                setEditing(false);
                setError("");
                setSuccess("");
              }}
              onSave={handleSave}
              onChange={handleChange}
            />
          )}

          {/* Quick Actions */}
          {user && (
            <div className="px-6 pb-6">
              <QuickActions
                userRole={user.role}
                onChangePassword={() => router.push("/auth/reset-password")}
                onBecomeGuide={() => router.push("/become-guide")}
                onManageOffers={() => router.push("/guide/my-offers")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
