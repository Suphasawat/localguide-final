"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getUser } from "../services/auth.service";
import { useRouter } from "next/navigation";

const Profile = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const user = getUser();

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const isGuide = user.roleId === 2;
  const isAdmin = user.roleId === 3;

  const renderProfileContent = () => {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative h-24 w-24">
            <Image
              src={user.avatar || "https://via.placeholder.com/96"}
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-600 text-sm font-semibold mb-2">ชื่อเล่น</h3>
            <p className="text-gray-900">{user.nickname || "-"}</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-semibold mb-2">วันเกิด</h3>
            <p className="text-gray-900">
              {new Date(user.birthDate).toLocaleDateString("th-TH")}
            </p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-semibold mb-2">เบอร์โทร</h3>
            <p className="text-gray-900">{user.phone}</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-semibold mb-2">เพศ</h3>
            <p className="text-gray-900">{user.sex}</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-semibold mb-2">สัญชาติ</h3>
            <p className="text-gray-900">{user.nationality}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderGuideContent = () => {
    if (!isGuide) return null;
    return (
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">ข้อมูลไกด์</h2>
        {/* Add guide specific content here */}
      </div>
    );
  };

  const renderAdminContent = () => {
    if (!isAdmin) return null;
    return (
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">จัดการระบบ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/guides"
            className="p-4 bg-rose-50 rounded-lg hover:bg-rose-100"
          >
            <h3 className="font-semibold text-rose-600">จัดการไกด์</h3>
            <p className="text-sm text-gray-600">อนุมัติและจัดการข้อมูลไกด์</p>
          </Link>
          <Link
            href="/admin/users"
            className="p-4 bg-rose-50 rounded-lg hover:bg-rose-100"
          >
            <h3 className="font-semibold text-rose-600">จัดการผู้ใช้</h3>
            <p className="text-sm text-gray-600">ดูและจัดการข้อมูลผู้ใช้</p>
          </Link>
          <Link
            href="/admin/bookings"
            className="p-4 bg-rose-50 rounded-lg hover:bg-rose-100"
          >
            <h3 className="font-semibold text-rose-600">จัดการการจอง</h3>
            <p className="text-sm text-gray-600">ดูและจัดการข้อมูลการจอง</p>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-8">
        <ul className="flex space-x-4 border-b">
          <li>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 font-medium ${
                activeTab === "profile"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              โปรไฟล์
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 font-medium ${
                activeTab === "bookings"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              การจอง
            </button>
          </li>
          {isGuide && (
            <li>
              <button
                onClick={() => setActiveTab("guide")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "guide"
                    ? "text-rose-600 border-b-2 border-rose-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ข้อมูลไกด์
              </button>
            </li>
          )}
        </ul>
      </nav>

      {activeTab === "profile" && (
        <>
          {renderProfileContent()}
          {renderGuideContent()}
          {renderAdminContent()}
        </>
      )}
      {activeTab === "bookings" && <div>Bookings content</div>}
      {activeTab === "guide" && isGuide && <div>Guide management content</div>}
    </div>
  );
};

export default Profile;
