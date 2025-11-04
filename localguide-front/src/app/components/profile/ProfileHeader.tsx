import { useRef, useState } from "react";
import { userAPI } from "@/app/lib/api";

interface UserProfile {
  FirstName: string;
  LastName: string;
  Nickname: string;
  Avatar: string;
  AuthUser: {
    Email: string;
  };
  Role: {
    Name: string;
  };
}

interface ProfileHeaderProps {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const apiBaseEnv =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  const apiBase = apiBaseEnv.replace(/\/api$/, "");
  const avatarSrc = profile.Avatar
    ? profile.Avatar.startsWith("http")
      ? profile.Avatar
      : `${apiBase}${profile.Avatar}`
    : null;

  const getRoleName = (roleName: string) => {
    switch (roleName) {
      case "user":
        return "นักท่องเที่ยว";
      case "guide":
        return "ไกด์ท่องเที่ยว";
      case "admin":
        return "ผู้ดูแลระบบ";
      default:
        return "ผู้ใช้งาน";
    }
  };

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic client-side validation
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }
    const form = new FormData();
    form.append("avatar", file);
    try {
      setUploading(true);
      const res = await userAPI.uploadAvatar(form);
      // Reload page or update UI
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถอัพโหลดรูปได้");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-emerald-600 px-6 py-8">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
          {profile.Avatar ? (
            <img
              src={avatarSrc || profile.Avatar}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <span className="text-emerald-600 text-2xl font-bold">
              {profile.FirstName?.charAt(0) ||
                profile.AuthUser?.Email?.charAt(0) ||
                "U"}
            </span>
          )}
        </div>
        <div className="text-white">
          <h2 className="text-2xl font-bold">
            {profile.FirstName || profile.LastName
              ? `${profile.FirstName} ${profile.LastName}`
              : profile.Nickname || "ผู้ใช้งาน"}
          </h2>
          <p className="text-emerald-100">{profile.AuthUser?.Email}</p>
          <p className="text-emerald-100">{getRoleName(profile.Role?.Name)}</p>
        </div>
      </div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <button
        onClick={handlePick}
        className="mt-4 px-4 py-2 bg-white text-emerald-600 rounded-md"
        disabled={uploading}
      >
        {uploading ? "กำลังอัพโหลด..." : "อัพโหลดรูปโปรไฟล์"}
      </button>
    </div>
  );
}
