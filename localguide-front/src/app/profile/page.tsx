"use client";
import { getUser, logout } from "../services/auth.service";
import { getUserById, editUser } from "../services/user.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdPerson } from "react-icons/md";
import { useEffect, useState } from "react";

export default function Profile() {
  const user = getUser();
  const router = useRouter();
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      getUserById(user.id)
        .then((data) => {
          setUserDetail(data);
          setEditForm(data); // เตรียมข้อมูลสำหรับแก้ไข
          setLoading(false);
        })
        .catch((err: any) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const updated = await editUser(user.id, editForm);
      setUserDetail(updated);
      setEditMode(false);
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaveLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-amber-100 via-white to-orange-100">
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl border border-amber-100 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-amber-700 mb-2">โปรไฟล์</h1>
          <p className="text-gray-500 mb-4">
            กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์
          </p>
          <button
            className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition"
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-amber-100 via-white to-orange-100">
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl border border-amber-100 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-amber-700 mb-2">
            กำลังโหลดข้อมูลโปรไฟล์...
          </h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-amber-100 via-white to-orange-100">
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl border border-amber-100 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-amber-700 mb-2">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-gray-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-amber-100 via-white to-orange-100">
      <div className="bg-white/90 p-8 rounded-2xl shadow-xl border border-amber-100 max-w-md w-full flex flex-col items-center">
        <div className="bg-amber-100 rounded-full p-4 mb-4">
          {userDetail && userDetail.Avatar ? (
            <img
              src={userDetail.Avatar}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover border border-amber-200 bg-white"
            />
          ) : (
            <MdPerson className="text-amber-600 w-12 h-12" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-amber-700 mb-2">
          โปรไฟล์ผู้ใช้
        </h1>
        <div className="text-gray-700 text-lg mb-2">{user.email}</div>
        {editMode && userDetail ? (
          <div className="text-left w-full mt-4">
            <div className="mb-1">
              <span className="font-semibold">ชื่อ:</span>{" "}
              <input
                type="text"
                name="FirstName"
                value={editForm.FirstName || ""}
                onChange={handleEditChange}
                className="border rounded px-2 py-1 ml-2 w-32"
              />
              <input
                type="text"
                name="LastName"
                value={editForm.LastName || ""}
                onChange={handleEditChange}
                className="border rounded px-2 py-1 ml-2 w-32"
              />
            </div>
            <div className="mb-1">
              <span className="font-semibold">ชื่อเล่น:</span>{" "}
              <input
                type="text"
                name="Nickname"
                value={editForm.Nickname || ""}
                onChange={handleEditChange}
                className="border rounded px-2 py-1 ml-2 w-32"
              />
            </div>
            <div className="mb-1">
              <span className="font-semibold">เบอร์โทร:</span>{" "}
              <input
                type="text"
                name="Phone"
                value={editForm.Phone || ""}
                onChange={handleEditChange}
                className="border rounded px-2 py-1 ml-2 w-32"
              />
            </div>
            <div className="mb-1">
              <span className="font-semibold">วันเกิด:</span>{" "}
              <input
                type="date"
                name="BirthDate"
                value={
                  editForm.BirthDate ? editForm.BirthDate.slice(0, 10) : ""
                }
                onChange={handleEditChange}
                className="border rounded px-2 py-1 ml-2 w-40"
              />
            </div>
            <div className="mb-1">
              <span className="font-semibold">สัญชาติ:</span>{" "}
              <input
                type="text"
                name="Nationality"
                value={editForm.Nationality || ""}
                onChange={handleEditChange}
                className="border rounded px-2 py-1 ml-2 w-32"
              />
            </div>
            <div className="mb-1">
              <span className="font-semibold">เพศ:</span>{" "}
              <input
                type="text"
                name="Sex"
                value={editForm.Sex || ""}
                onChange={handleEditChange}
                className="border rounded px-2 py-1 ml-2 w-32"
              />
            </div>
            {editForm.Avatar && (
              <div className="mb-1">
                <span className="font-semibold">Avatar:</span>{" "}
                <img
                  src={editForm.Avatar}
                  alt="avatar"
                  className="inline w-12 h-12 rounded-full border ml-2"
                />
              </div>
            )}
            {saveError && <div className="text-red-600 mt-2">{saveError}</div>}
            {saveSuccess && (
              <div className="text-green-600 mt-2">บันทึกสำเร็จ</div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition"
                onClick={handleSave}
                disabled={saveLoading}
                type="button"
              >
                {saveLoading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                className="bg-gray-200 text-amber-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                onClick={() => {
                  setEditMode(false);
                  setEditForm(userDetail);
                  setSaveError("");
                  setSaveSuccess(false);
                }}
                type="button"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        ) : (
          userDetail && (
            <div className="text-left w-full mt-4">
              <div className="mb-1">
                <span className="font-semibold">ชื่อ:</span>{" "}
                {userDetail.FirstName ? userDetail.FirstName : "-"}{" "}
                {userDetail.LastName ? userDetail.LastName : ""}
              </div>
              <div className="mb-1">
                <span className="font-semibold">ชื่อเล่น:</span>{" "}
                {userDetail.Nickname ? userDetail.Nickname : "-"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">เบอร์โทร:</span>{" "}
                {userDetail.Phone ? userDetail.Phone : "-"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">วันเกิด:</span>{" "}
                {userDetail.BirthDate
                  ? new Date(userDetail.BirthDate).toLocaleDateString("th-TH")
                  : "-"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">สัญชาติ:</span>{" "}
                {userDetail.Nationality ? userDetail.Nationality : "-"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">เพศ:</span>{" "}
                {userDetail.Sex ? userDetail.Sex : "-"}
              </div>
              <button
                className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition mt-4"
                onClick={() => {
                  setEditMode(true);
                  setSaveError("");
                  setSaveSuccess(false);
                }}
                type="button"
              >
                แก้ไขโปรไฟล์
              </button>
              {user?.role === 1 && (
                <Link
                  href="/guide/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition mt-2 inline-block text-center"
                >
                  สมัครเป็นไกด์
                </Link>
              )}
            </div>
          )
        )}
        <div className="flex flex-col gap-2 mt-6">
          <button
            className="bg-gray-200 text-amber-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            onClick={handleLogout}
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
