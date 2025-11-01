import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api, adminAPI } from "../../lib/api";
import { GuideVerification, TripReport } from "../../types/index";

export function useAdminData() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("verifications");
  const [verifications, setVerifications] = useState<GuideVerification[]>([]);
  const [reports, setReports] = useState<TripReport[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === "verifications") {
        const response = await api.get("/admin/verifications");
        setVerifications(response.data?.verifications || []);
      } else if (activeTab === "reports") {
        const response = await api.get("/admin/trip-reports");
        setReports(response.data?.reports || []);
      } else if (activeTab === "disputes") {
        const response = await api.get("/admin/trip-reports");
        // Filter dispute reports (both pending and resolved)
        const allReports = response.data?.reports || [];
        const disputeReports = allReports.filter(
          (r: any) => r.ReportType === "dispute_no_show"
        );
        setDisputes(disputeReports);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const handleApproveGuide = async (
    verificationId: number,
    status: "approved" | "rejected"
  ) => {
    try {
      await api.put(`/admin/verifications/${verificationId}/status`, {
        status,
      });
      loadData();
    } catch (error) {
      console.error("Failed to update verification:", error);
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const handleReportAction = async (reportId: number, action: string) => {
    try {
      await api.put(`/admin/trip-reports/${reportId}`, { action });
      loadData();
    } catch (error) {
      console.error("Failed to handle report:", error);
      alert("ไม่สามารถจัดการรายงานได้");
    }
  };

  const handleResolveDispute = async (
    bookingId: number,
    decision: string,
    adminNotes: string
  ) => {
    try {
      await adminAPI.resolveDispute(bookingId, decision, adminNotes);
      loadData();
    } catch (err: any) {
      // Surface backend error message (if available) to the admin
      console.error("Failed to resolve dispute:", err);
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message;
      alert(`ไม่สามารถตัดสินข้อพิพาทได้: ${backendMsg}`);
      // Do not rethrow to avoid unhandled promise rejection in UI
      return;
    }
  };

  return {
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
  };
}
