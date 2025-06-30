"use client";
import { getUser, logout } from "../services/auth.service";
import { getUserById } from "../services/user.service";
import { useRouter } from "next/navigation";
import { MdPerson } from "react-icons/md";
import { useEffect, useState } from "react";

export default function Profile() {
  const user = getUser();
  const router = useRouter();
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      getUserById(user.id)
        .then((data) => {
          setUserDetail(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-rose-100 via-white to-blue-100">
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl border border-rose-100 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-rose-700 mb-2">โปรไฟล์</h1>
          <p className="text-gray-500 mb-4">
            กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์
          </p>
          <button
            className="bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-700 transition"
            onClick={() => router.push("/auth/login")}
          >
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-rose-100 via-white to-blue-100">
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl border border-rose-100 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-rose-700 mb-2">
            กำลังโหลดข้อมูลโปรไฟล์...
          </h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-rose-100 via-white to-blue-100">
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl border border-rose-100 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-rose-700 mb-2">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-gray-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-rose-100 via-white to-blue-100">
      <div className="bg-white/90 p-8 rounded-2xl shadow-xl border border-rose-100 max-w-md w-full flex flex-col items-center">
        <div className="bg-rose-100 rounded-full p-4 mb-4">
          <MdPerson className="text-rose-600 w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-rose-700 mb-2">โปรไฟล์ผู้ใช้</h1>
        <div className="text-gray-700 text-lg mb-2">{user.email}</div>
        <div className="text-gray-500 text-sm mb-2">User ID: {user.id}</div>
        {userDetail && (
          <div className="text-left w-full mt-4">
            <div className="mb-1">
              <span className="font-semibold">ชื่อ:</span>{" "}
              {userDetail.FirstName} {userDetail.LastName}
            </div>
            <div className="mb-1">
              <span className="font-semibold">ชื่อเล่น:</span>{" "}
              {userDetail.Nickname}
            </div>
            <div className="mb-1">
              <span className="font-semibold">เบอร์โทร:</span>{" "}
              {userDetail.Phone}
            </div>
            <div className="mb-1">
              <span className="font-semibold">วันเกิด:</span>{" "}
              {userDetail.BirthDate}
            </div>
            <div className="mb-1">
              <span className="font-semibold">สัญชาติ:</span>{" "}
              {userDetail.Nationality}
            </div>
            <div className="mb-1">
              <span className="font-semibold">เพศ:</span> {userDetail.Sex}
            </div>
          </div>
        )}
        <button
          className="bg-gray-200 text-rose-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition mt-6"
          onClick={handleLogout}
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
