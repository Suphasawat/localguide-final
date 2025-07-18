"use client";

import { useState, useEffect } from "react";
import { adminService, Verification } from "../../services/admin.service";
import { getUser } from "../../services/auth.service";
import { useRouter } from "next/navigation";

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    setUser(u);
  }, []);

  useEffect(() => {
    if (user === null) return; // wait for user to be set
    if (!user || user.role !== 3) {
      router.push("/");
      return;
    }
    loadVerifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingVerifications();
      setVerifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (
    id: number,
    status: "approved" | "rejected"
  ) => {
    setProcessingId(id);
    try {
      const success = await adminService.updateVerificationStatus(id, status);
      if (success) {
        await loadVerifications(); // โหลดข้อมูลใหม่
      } else {
        setError("ไม่สามารถอัพเดทสถานะได้");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setProcessingId(null);
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
            onClick={loadVerifications}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            จัดการการยืนยันตัวตน
          </h1>
          <p className="mt-2 text-gray-600">
            อนุมัติหรือปฏิเสธการสมัครเป็นไกด์ท้องถิ่น
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              รายการรอการยืนยัน ({verifications.length} รายการ)
            </h2>
          </div>

          {verifications.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">ไม่มีรายการรอการยืนยัน</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {verifications.map((verification) => (
                <div key={verification.ID} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-amber-600 font-medium text-lg">
                              {verification.User.FirstName.charAt(0)}
                              {verification.User.LastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {verification.User.FirstName}{" "}
                            {verification.User.LastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {verification.User.Nickname}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            ข้อมูลพื้นที่
                          </h4>
                          <p className="text-sm text-gray-600">
                            {verification.District &&
                              `${verification.District}, `}
                            {verification.City}, {verification.Province}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            อัตราค่าบริการ
                          </h4>
                          <p className="text-sm text-gray-600">
                            ฿{verification.Price.toLocaleString()}/วัน
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          แนะนำตัว
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {verification.Bio}
                        </p>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          คำอธิบาย
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {verification.Description}
                        </p>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          ภาษาที่สื่อสารได้
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {verification.Language.split(",").map(
                            (lang, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"
                              >
                                {lang.trim()}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {verification.Attraction && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            สถานที่ท่องเที่ยวที่แนะนำ
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {verification.Attraction.split(",").map(
                              (attraction, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {attraction.trim()}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          วันที่สมัคร
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(verification.CreatedAt).toLocaleDateString(
                            "th-TH",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          สถานะ
                        </h4>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            verification.Status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : verification.Status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {verification.Status}
                        </span>
                      </div>
                    </div>

                    {verification.Status === "pending" && (
                      <div className="ml-6 flex flex-col gap-2">
                        <button
                          onClick={() =>
                            handleVerificationAction(
                              verification.ID,
                              "approved"
                            )
                          }
                          disabled={processingId === verification.ID}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                        >
                          {processingId === verification.ID
                            ? "กำลังดำเนินการ..."
                            : "อนุมัติ"}
                        </button>
                        <button
                          onClick={() =>
                            handleVerificationAction(
                              verification.ID,
                              "rejected"
                            )
                          }
                          disabled={processingId === verification.ID}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
