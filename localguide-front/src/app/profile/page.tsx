"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [profileSection, setProfileSection] = useState("info");

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar />

        <div className="mt-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">โปรไฟล์</h1>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-xl font-medium text-gray-900">
                ข้อมูลส่วนตัว
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                ข้อมูลส่วนตัวและการตั้งค่าบัญชี
              </p>
            </div>

            <div className="border-t border-gray-200">
              <div className="flex border-b">
                <button
                  className={`flex-1 text-center py-4 font-medium ${
                    profileSection === "info"
                      ? "border-b-2 border-rose-500 text-rose-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setProfileSection("info")}
                >
                  ข้อมูลส่วนตัว
                </button>
                <button
                  className={`flex-1 text-center py-4 font-medium ${
                    profileSection === "security"
                      ? "border-b-2 border-rose-500 text-rose-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setProfileSection("security")}
                >
                  ความปลอดภัย
                </button>
                <button
                  className={`flex-1 text-center py-4 font-medium ${
                    profileSection === "preferences"
                      ? "border-b-2 border-rose-500 text-rose-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setProfileSection("preferences")}
                >
                  การตั้งค่า
                </button>
              </div>

              {profileSection === "info" && (
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        อีเมล
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user?.email}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        รหัสผู้ใช้
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        สถานะบัญชี
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          ใช้งาน
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {profileSection === "security" && (
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    เปลี่ยนรหัสผ่าน
                  </h3>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="current-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        รหัสผ่านปัจจุบัน
                      </label>
                      <input
                        type="password"
                        name="current-password"
                        id="current-password"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        รหัสผ่านใหม่
                      </label>
                      <input
                        type="password"
                        name="new-password"
                        id="new-password"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        ยืนยันรหัสผ่านใหม่
                      </label>
                      <input
                        type="password"
                        name="confirm-password"
                        id="confirm-password"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                      />
                    </div>
                    <div className="pt-5">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                      >
                        บันทึกการเปลี่ยนแปลง
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {profileSection === "preferences" && (
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    การตั้งค่าการแจ้งเตือน
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="email-notifications"
                          name="email-notifications"
                          type="checkbox"
                          className="focus:ring-rose-500 h-4 w-4 text-rose-600 border-gray-300 rounded"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="email-notifications"
                          className="font-medium text-gray-700"
                        >
                          อีเมลแจ้งเตือน
                        </label>
                        <p className="text-gray-500">
                          รับการแจ้งเตือนเกี่ยวกับการจองและข้อความใหม่ทางอีเมล
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="marketing-emails"
                          name="marketing-emails"
                          type="checkbox"
                          className="focus:ring-rose-500 h-4 w-4 text-rose-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="marketing-emails"
                          className="font-medium text-gray-700"
                        >
                          อีเมลการตลาด
                        </label>
                        <p className="text-gray-500">
                          รับข้อมูลส่งเสริมการขายและส่วนลดพิเศษ
                        </p>
                      </div>
                    </div>
                    <div className="pt-5">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                      >
                        บันทึกการตั้งค่า
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
