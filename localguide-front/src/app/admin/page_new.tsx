"use client";

import AdminTabs from "../components/admin/AdminTabs";
import VerificationsTab from "../components/admin/VerificationsTab";
import ReportsTab from "../components/admin/ReportsTab";
import PaymentsTab from "../components/admin/PaymentsTab";
import { useAdminData } from "../components/admin/useAdminData";

export default function AdminDashboard() {
  const {
    activeTab,
    setActiveTab,
    verifications,
    reports,
    loading,
    error,
    handleApproveGuide,
    handleReportAction,
  } = useAdminData();

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

        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {activeTab === "verifications" && (
          <VerificationsTab
            verifications={verifications}
            onApprove={handleApproveGuide}
          />
        )}

        {activeTab === "reports" && (
          <ReportsTab reports={reports} onAction={handleReportAction} />
        )}

        {activeTab === "payments" && <PaymentsTab />}
      </div>
    </div>
  );
}
