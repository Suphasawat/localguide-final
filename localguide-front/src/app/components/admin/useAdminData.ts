import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { GuideVerification, TripReport } from "../../types/index";

export function useAdminData() {
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

  return {
    activeTab,
    setActiveTab,
    verifications,
    reports,
    loading,
    error,
    handleApproveGuide,
    handleReportAction,
  };
}
