"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { GuideVerification, TripReport } from "../types/index";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("verifications");
  const [verifications, setVerifications] = useState<GuideVerification[]>([]);
  const [reports, setReports] = useState<TripReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== 3) {
      router.push("/dashboard");
      return;
    }

    loadData();
  }, [user, isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === "verifications") {
        const response = await api.get("/admin/verifications");
        setVerifications(response.data?.verifications || []);
      } else if (activeTab === "reports") {
        const response = await api.get("/admin/trip-reports");
        setReports(response.data?.reports || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 3) {
      loadData();
    }
  }, [activeTab, user]);

  const handleApproveGuide = async (
    verificationId: number,
    status: "approved" | "rejected"
  ) => {
    try {
      await api.put(`/admin/verifications/${verificationId}/status`, {
        status,
      });
      loadData(); // Reload data
    } catch (error) {
      console.error("Failed to update verification:", error);
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const handleReportAction = async (reportId: number, action: string) => {
    try {
      await api.put(`/admin/trip-reports/${reportId}`, { action });
      loadData(); // Reload data
    } catch (error) {
      console.error("Failed to handle report:", error);
      alert("ไม่สามารถจัดการรายงานได้");
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            แผงควบคุมผู้ดูแลระบบ
          </h1>
          <p className="mt-2 text-gray-600">
            จัดการการอนุมัติไกด์และรายงานปัญหา
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("verifications")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "verifications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                การอนุมัติไกด์
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reports"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                รายงานปัญหา
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "payments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                การจ่ายเงิน
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Guide Verifications Tab */}
        {activeTab === "verifications" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">คำขออนุมัติเป็นไกด์</h2>

            {verifications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">ไม่มีคำขออนุมัติที่รอพิจารณา</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {verifications.map((verification) => (
                  <div
                    key={verification.ID}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {verification.User?.FirstName}{" "}
                          {verification.User?.LastName}
                        </h3>
                        <p className="text-gray-600">
                          {verification.User?.Email}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
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

                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>📍 {verification.Province?.Name}</div>
                      <div>
                        💰 ราคา: {verification.Price?.toLocaleString()} บาท/วัน
                      </div>
                      <div className="md:col-span-2">📝 {verification.Bio}</div>
                      <div className="md:col-span-2">
                        📋 {verification.Description}
                      </div>
                    </div>

                    {verification.Status === "pending" && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            handleApproveGuide(verification.ID, "approved")
                          }
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() =>
                            handleApproveGuide(verification.ID, "rejected")
                          }
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trip Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">รายงานปัญหา</h2>

            {reports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">ไม่มีรายงานปัญหา</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reports.map((report) => (
                  <div
                    key={report.ID}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {report.Title}
                        </h3>
                        <p className="text-gray-600">
                          ประเภท: {report.ReportType}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          report.Severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : report.Severity === "high"
                            ? "bg-orange-100 text-orange-800"
                            : report.Severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {report.Severity}
                      </span>
                    </div>

                    <div className="mb-4 text-sm space-y-2">
                      <div>
                        👤 ผู้รายงาน: {report.Reporter?.FirstName}{" "}
                        {report.Reporter?.LastName}
                      </div>
                      <div>
                        🎯 ผู้ถูกรายงาน: {report.ReportedUser?.FirstName}{" "}
                        {report.ReportedUser?.LastName}
                      </div>
                      <div className="mt-3">📝 {report.Description}</div>
                    </div>

                    {report.Status === "pending" && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            handleReportAction(report.ID, "investigating")
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          เริ่มสอบสวน
                        </button>
                        <button
                          onClick={() =>
                            handleReportAction(report.ID, "resolved")
                          }
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          แก้ไขแล้ว
                        </button>
                        <button
                          onClick={() =>
                            handleReportAction(report.ID, "dismissed")
                          }
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">การจ่ายเงิน</h2>
            <div className="text-center py-12">
              <p className="text-gray-500">
                ฟีเจอร์การจัดการการจ่ายเงินจะเปิดใช้เร็วๆ นี้
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
