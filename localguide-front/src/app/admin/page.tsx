"use client";

import AdminTabs from "../components/admin/AdminTabs";
import VerificationsTab from "../components/admin/VerificationsTab";
import ReportsTab from "../components/admin/ReportsTab";
import PaymentsTab from "../components/admin/PaymentsTab";
import { useAdminData } from "../components/admin/useAdminData";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import dynamic from "next/dynamic";

// Use dynamic import and map to default export explicitly
const DisputesTab = dynamic(
  () => import("../components/admin/DisputesTab").then((m) => m.default),
  { ssr: false }
);

export default function AdminDashboard() {
  const {
    activeTab,
    setActiveTab,
    verifications,
    reports,
    disputes,
    loading,
    error,
    handleApproveGuide,
    handleReportAction,
    handleResolveDispute,
  } = useAdminData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-emerald-800 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === "verifications") {
      return (
        <VerificationsTab
          verifications={verifications}
          onApprove={handleApproveGuide}
        />
      );
    }

    if (activeTab === "reports") {
      return <ReportsTab reports={reports} onAction={handleReportAction} />;
    }

    if (activeTab === "disputes") {
      return (
        <DisputesTab disputes={disputes} onResolve={handleResolveDispute} />
      );
    }

    if (activeTab === "payments") {
      return <PaymentsTab />;
    }

    return null;
  };

  const verificationCount = Array.isArray(verifications)
    ? verifications.length
    : 0;
  const reportCount = Array.isArray(reports) ? reports.length : 0;
  const disputeCount = Array.isArray(disputes)
    ? disputes.filter((d: any) => d.Status === "pending").length
    : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-emerald-50">
        {/* Header */}
        <header className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-b-3xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <p className="uppercase tracking-wider text-emerald-100 text-xs font-semibold">
              Admin
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
              แผงควบคุมผู้ดูแลระบบ
            </h1>
            <p className="mt-2 text-emerald-100">
              จัดการการอนุมัติไกด์ รายงานปัญหา และการชำระเงิน
            </p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/20">
                <div className="text-sm text-emerald-100">
                  คำขออนุมัติค้างอยู่
                </div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {verificationCount}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/20">
                <div className="text-sm text-emerald-100">
                  รายงานที่ต้องตรวจสอบ
                </div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {reportCount}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/20">
                <div className="text-sm text-emerald-100">ข้อพิพาทรอตัดสิน</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {disputeCount}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Card: Tabs header + error */}
          <div className="rounded-2xl bg-white shadow-sm border border-emerald-100">
            <div className="p-4 sm:p-6 border-b border-emerald-100">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    การจัดการระบบ
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    เลือกแท็บเพื่อจัดการหัวข้อที่ต้องการ
                  </p>
                </div>
                <div className="w-full sm:w-auto">
                  <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Card body */}
            <div className="p-4 sm:p-6">{renderContent()}</div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
