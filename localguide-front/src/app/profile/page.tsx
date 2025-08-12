"use client";
import { getUser, logout, getToken } from "../services/auth.service";
import { getUserById, editUser, User } from "../services/user.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdPerson } from "react-icons/md";
import { useEffect, useState } from "react";

export default function Profile() {
  const user = getUser();
  const router = useRouter();
  const [userDetail, setUserDetail] = useState<User>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>();
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

  // Helper function to get role info
  const getRoleInfo = (roleId: number) => {
    switch (roleId) {
      case 1:
        return {
          name: "ผู้ใช้งานทั่วไป",
          badge: "🧳 นักท่องเที่ยว",
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
        };
      case 2:
        return {
          name: "ไกด์ท้องถิ่น",
          badge: "🗺️ ไกด์ท้องถิ่น",
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
        };
      case 3:
        return {
          name: "ผู้ดูแลระบบ",
          badge: "👑 ผู้ดูแลระบบ",
          color: "from-purple-500 to-pink-500",
          bgColor: "bg-purple-50",
          textColor: "text-purple-700",
        };
      default:
        return {
          name: "ผู้ใช้งาน",
          badge: "👤 ผู้ใช้งาน",
          color: "from-gray-500 to-slate-500",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
        };
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-amber-200 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              โปรไฟล์ผู้ใช้
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์และจัดการบัญชีของคุณ
            </p>
            <button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => router.push("/auth/login")}
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-amber-200 max-w-md w-full text-center">
            <div className="animate-spin w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              กำลังโหลดข้อมูล...
            </h1>
            <p className="text-gray-600">
              กรุณารอสักครู่ ระบบกำลังดึงข้อมูลโปรไฟล์ของคุณ
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-red-200 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-700 mb-3">
              เกิดข้อผิดพลาด
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => window.location.reload()}
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-200 max-w-2xl w-full overflow-hidden">
          {/* Header Section */}
          <div
            className={`bg-gradient-to-r ${roleInfo.color} p-8 text-center text-white relative`}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              {/* Profile Avatar */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                {userDetail && userDetail.Avatar ? (
                  <img
                    src={userDetail.Avatar}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <MdPerson className="text-white w-12 h-12" />
                )}
              </div>

              {/* Role Badge */}
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-3">
                <span className="text-lg font-semibold">{roleInfo.badge}</span>
              </div>

              <h1 className="text-3xl font-bold mb-2">
                {userDetail?.FirstName && userDetail?.LastName
                  ? `${userDetail.FirstName} ${userDetail.LastName}`
                  : userDetail?.FirstName || userDetail?.LastName
                  ? `${userDetail.FirstName || ""} ${
                      userDetail.LastName || ""
                    }`.trim()
                  : "ยินดีต้อนรับ"}
              </h1>
              <p className="text-white/90 text-lg">{user.email}</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {editMode && userDetail ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-amber-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  แก้ไขข้อมูลส่วนตัว
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อ
                    </label>
                    <input
                      type="text"
                      name="FirstName"
                      value={editForm?.FirstName || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-black"
                      style={{ color: "#000" }}
                      placeholder="กรอกชื่อ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      นามสกุล
                    </label>
                    <input
                      type="text"
                      name="LastName"
                      value={editForm?.LastName || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-black"
                      style={{ color: "#000" }}
                      placeholder="กรอกนามสกุล"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อเล่น
                    </label>
                    <input
                      type="text"
                      name="Nickname"
                      value={editForm?.Nickname || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-black"
                      style={{ color: "#000" }}
                      placeholder="กรอกชื่อเล่น"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="text"
                      name="Phone"
                      value={editForm?.Phone || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-black"
                      style={{ color: "#000" }}
                      placeholder="กรอกเบอร์โทรศัพท์"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      วันเกิด
                    </label>
                    <input
                      type="date"
                      name="BirthDate"
                      value={
                        editForm?.BirthDate
                          ? editForm.BirthDate.slice(0, 10)
                          : ""
                      }
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-black"
                      style={{ color: "#000" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      สัญชาติ
                    </label>
                    <input
                      type="text"
                      name="Nationality"
                      value={editForm?.Nationality || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-black"
                      style={{ color: "#000" }}
                      placeholder="กรอกสัญชาติ"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เพศ
                    </label>
                    <select
                      name="Sex"
                      value={editForm?.Sex || ""}
                      onChange={(e) =>
                        setEditForm((prev: any) => ({
                          ...prev,
                          Sex: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-black"
                      style={{ color: "#000" }}
                    >
                      <option value="">เลือกเพศ</option>
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="ไม่ระบุ">ไม่ระบุ</option>
                    </select>
                  </div>
                </div>

                {saveError && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <div className="flex">
                      <svg
                        className="h-5 w-5 text-red-400 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-red-700 font-medium">{saveError}</p>
                    </div>
                  </div>
                )}

                {saveSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                    <div className="flex">
                      <svg
                        className="h-5 w-5 text-green-400 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-green-700 font-medium">
                        บันทึกข้อมูลเรียบร้อยแล้ว
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled={saveLoading}
                    type="button"
                  >
                    {saveLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        กำลังบันทึก...
                      </div>
                    ) : (
                      "บันทึกข้อมูล"
                    )}
                  </button>
                  <button
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
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
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                    ข้อมูลส่วนตัว
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        ชื่อ - นามสกุล
                      </label>
                      <p className="text-lg text-gray-900">
                        {userDetail.FirstName || userDetail.LastName ? (
                          `${userDetail.FirstName || ""} ${
                            userDetail.LastName || ""
                          }`.trim()
                        ) : (
                          <span
                            className="text-amber-600 font-medium cursor-pointer hover:text-amber-700 transition-colors"
                            onClick={() => setEditMode(true)}
                          >
                            เพิ่มข้อมูล
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        ชื่อเล่น
                      </label>
                      <p className="text-lg text-gray-900">
                        {userDetail.Nickname || (
                          <span
                            className="text-amber-600 font-medium cursor-pointer hover:text-amber-700 transition-colors"
                            onClick={() => setEditMode(true)}
                          >
                            เพิ่มข้อมูล
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        เบอร์โทรศัพท์
                      </label>
                      <p className="text-lg text-gray-900">
                        {userDetail.Phone || (
                          <span
                            className="text-amber-600 font-medium cursor-pointer hover:text-amber-700 transition-colors"
                            onClick={() => setEditMode(true)}
                          >
                            เพิ่มข้อมูล
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        วันเกิด
                      </label>
                      <p className="text-lg text-gray-900">
                        {userDetail.BirthDate ? (
                          new Date(userDetail.BirthDate).toLocaleDateString(
                            "th-TH"
                          )
                        ) : (
                          <span
                            className="text-amber-600 font-medium cursor-pointer hover:text-amber-700 transition-colors"
                            onClick={() => setEditMode(true)}
                          >
                            เพิ่มข้อมูล
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        สัญชาติ
                      </label>
                      <p className="text-lg text-gray-900">
                        {userDetail.Nationality || (
                          <span
                            className="text-amber-600 font-medium cursor-pointer hover:text-amber-700 transition-colors"
                            onClick={() => setEditMode(true)}
                          >
                            เพิ่มข้อมูล
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        เพศ
                      </label>
                      <p className="text-lg text-gray-900">
                        {userDetail.Sex || (
                          <span
                            className="text-amber-600 font-medium cursor-pointer hover:text-amber-700 transition-colors"
                            onClick={() => setEditMode(true)}
                          >
                            เพิ่มข้อมูล
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                      onClick={() => {
                        setEditMode(true);
                        setSaveError("");
                        setSaveSuccess(false);
                      }}
                      type="button"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      แก้ไขโปรไฟล์
                    </button>

                    {user.role === 1 && (
                      <Link
                        href="/guide/register"
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl text-center flex items-center justify-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        สมัครเป็นไกด์
                      </Link>
                    )}

                    {user.role === 3 && (
                      <Link
                        href="/admin/verifications"
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl text-center flex items-center justify-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        จัดการระบบ
                      </Link>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center"
                onClick={handleLogout}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
