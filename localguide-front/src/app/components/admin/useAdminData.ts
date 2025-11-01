"use client";

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
        // ✅ Filter dispute reports แล้วแนบรายงาน user_no_show ที่เกี่ยวข้อง (ล่าสุด)
        const allReports = response.data?.reports || [];

        const disputeReports = allReports
          .filter((r: any) => r.ReportType === "dispute_no_show")
          .map((dispute: any) => {
            const relatedReports = allReports.filter(
              (report: any) =>
                report.TripBookingID === dispute.TripBookingID &&
                report.ReportType === "user_no_show"
            );

            const parseDate = (value: string | undefined) => {
              if (!value) return 0;
              const timestamp = new Date(value).getTime();
              return Number.isNaN(timestamp) ? 0 : timestamp;
            };

            // ใช้ user_no_show ที่ใหม่สุด
            const originalReport = relatedReports.sort(
              (a: any, b: any) =>
                parseDate(b.CreatedAt || b.created_at) -
                parseDate(a.CreatedAt || a.created_at)
            )[0];

            return {
              ...dispute,
              OriginalReport: originalReport || null,
            };
          });

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
      await loadData();
    } catch (error) {
      console.error("Failed to update guide verification:", error);
    }
  };

  const handleReportAction = async (reportId: number, action: string) => {
    try {
      await api.put(`/admin/trip-reports/${reportId}/action`, {
        status: action,
      });
      await loadData();
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };

  const handleResolveDispute = async (
    bookingId: number,
    decision: string,
    reason: string
  ) => {
    try {
      await api.put(`/admin/trip-bookings/${bookingId}/resolve-dispute`, {
        decision,
        reason,
      });
      await loadData();
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
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
