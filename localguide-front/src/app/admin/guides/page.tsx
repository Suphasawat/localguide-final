"use client";

import { useState, useEffect } from "react";
import {
  adminService,
  Guide,
  Verification,
} from "../../services/admin.service";
import { getUser, getToken } from "../../services/auth.service";
import { useRouter } from "next/navigation";

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const user = getUser();
  const router = useRouter();

  useEffect(() => {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (!user || user.role !== 3) {
      router.push("/");
      return;
    }

    loadGuides();
  }, [router]);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError("กรุณาเข้าสู่ระบบใหม่");
        setGuides([]);
        setLoading(false);
        return;
      }
      const [guidesData, verificationsData] = await Promise.all([
        adminService.getAllGuides(),
        adminService.getVerifications(),
      ]);
      setGuides(Array.isArray(guidesData) ? guidesData : []);
      setVerifications(
        Array.isArray(verificationsData) ? verificationsData : []
      );
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setGuides([]);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={loadGuides}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  // สร้าง map สำหรับ lookup status
  const verificationStatusMap = verifications.reduce((acc, v) => {
    if (v.GuideID) acc[v.GuideID] = v.Status;
    return acc;
  }, {} as Record<number, string>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">จัดการไกด์</h1>
          <p className="mt-2 text-gray-600">
            จัดการและตรวจสอบข้อมูลไกด์ทั้งหมดในระบบ
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              รายการไกด์ทั้งหมด ({guides.length} คน)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ไกด์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ท้องที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ราคา/วัน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คะแนน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ภาษา
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guides.map((guide) => {
                  const status = verificationStatusMap[guide.ID] || "approved"; // fallback เป็น approved ถ้าไม่มี verification
                  return (
                    <tr key={guide.ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                              <span className="text-amber-600 font-medium">
                                {guide.User.FirstName.charAt(0)}
                                {guide.User.LastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {guide.User.FirstName} {guide.User.LastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {guide.User.Nickname}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {guide.District && `${guide.District}, `}
                          {guide.City}
                        </div>
                        <div className="text-sm text-gray-500">
                          {guide.Province}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ฿{guide.Price.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.round(guide.Rating || 0)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-1 text-sm text-gray-500">
                              ({guide.Rating || 0})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            status === "approved"
                              ? "bg-green-100 text-green-800"
                              : status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {status === "approved"
                            ? "อนุมัติแล้ว"
                            : status === "pending"
                            ? "รอการอนุมัติ"
                            : "ไม่อนุมัติ"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {guide.Language.slice(0, 2).map((lang) => (
                            <span
                              key={lang.ID}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"
                            >
                              {lang.Name}
                            </span>
                          ))}
                          {guide.Language.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{guide.Language.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {guides.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">ไม่มีข้อมูลไกด์ในระบบ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
