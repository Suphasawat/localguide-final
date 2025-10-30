"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { tripBookingAPI } from "../../lib/api";
import type { TripBooking as TripBookingType } from "../../types";
import Navbar from "@/app/components/Navbar";
import BookingStatus from "@/app/components/booking/BookingStatus";
import TripInformation from "@/app/components/booking/TripInformation";
import ContactInformation from "@/app/components/booking/ContactInformation";
import NotesSection from "@/app/components/booking/NotesSection";
import NoShowModal from "@/app/components/booking/NoShowModal";
import BookingHeader from "@/app/components/trip-booking-detail/BookingHeader";
import BookingMessages from "@/app/components/trip-booking-detail/BookingMessages";
import { useBookingHelpers } from "@/app/components/trip-booking-detail/useBookingHelpers";
import { useBookingTimeline } from "@/app/components/trip-booking-detail/useBookingTimeline";

export default function TripBookingDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<TripBookingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  // Trip status management state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [noShowReason, setNoShowReason] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Use custom hooks
  const helpers = useBookingHelpers();
  const { buildTimeline } = useBookingTimeline(helpers.getStatusText);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!bookingId) {
      router.push("/trip-bookings");
      return;
    }

    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, bookingId]);

  const loadBooking = async () => {
    try {
      const response = await tripBookingAPI.getById(Number(bookingId));
      const data = response.data?.booking ?? response.data; // support both shapes
      setBooking(data || null);
    } catch (error) {
      console.error("Failed to load booking:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const isOwner =
    booking && user?.id && helpers.getUserIdFromBooking(booking) === user.id;
  const isGuideOwner =
    booking && user?.id && helpers.getGuideIdFromBooking(booking) === user.id;

  const handlePayment = async () => {
    if (!booking) return;
    setPaying(true);
    setError("");
    setInfoMessage("");
    try {
      const resp = await tripBookingAPI.createPayment(Number(bookingId));
      const cs = resp.data?.client_secret;
      const pi = resp.data?.payment_intent_id;
      const amount = resp.data?.amount ?? helpers.getTotal(booking);

      if (!cs || !pi) {
        throw new Error("missing client secret or payment intent id");
      }

      router.push(
        `/trip-bookings/${bookingId}/payment?pi=${encodeURIComponent(
          pi
        )}&cs=${encodeURIComponent(cs)}&amount=${encodeURIComponent(amount)}`
      );
    } catch (e) {
      console.error(e);
      setError("ไม่สามารถสร้างการชำระเงินได้");
    } finally {
      setPaying(false);
    }
  };

  // Trip status actions
  const confirmGuideArrival = async () => {
    if (!booking) return;
    if (!confirm("ยืนยันว่าไกด์ได้มาถึงแล้ว?")) return;
    setActionLoading("confirm-arrival");
    setError("");
    setInfoMessage("");
    try {
      await tripBookingAPI.confirmGuideArrival(Number(bookingId));
      setInfoMessage("ยืนยันไกด์มาถึงแล้วสำเร็จ");
      await loadBooking();
    } catch (e) {
      console.error(e);
      setError("ไม่สามารถยืนยันการมาถึงของไกด์ได้");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmTripComplete = async () => {
    if (!booking) return;
    if (!confirm("ยืนยันว่าทริปเสร็จสิ้นแล้ว?")) return;
    setActionLoading("confirm-complete");
    setError("");
    setInfoMessage("");
    try {
      await tripBookingAPI.confirmTripComplete(Number(bookingId));
      setInfoMessage("ยืนยันทริปเสร็จสิ้นเรียบร้อย");
      await loadBooking();
    } catch (e) {
      console.error(e);
      setError("ไม่สามารถยืนยันการเสร็จสิ้นทริปได้");
    } finally {
      setActionLoading(null);
    }
  };

  const openReportNoShow = () => {
    setNoShowReason("");
    setShowNoShowModal(true);
  };

  const submitReportNoShow = async () => {
    if (!booking) return;
    if (!noShowReason.trim()) {
      setError("โปรดระบุเหตุผลในการรายงานไกด์ไม่มา");
      return;
    }
    setActionLoading("report-no-show");
    setError("");
    setInfoMessage("");
    try {
      console.log("Sending report guide no-show request:", {
        bookingId,
        reason: noShowReason,
        description: noShowReason,
      });

      const response = await tripBookingAPI.reportGuideNoShow(
        Number(bookingId),
        {
          reason: noShowReason,
          description: noShowReason,
        }
      );

      console.log("Report guide no-show response:", response);
      setShowNoShowModal(false);
      setInfoMessage("รายงานไกด์ไม่มาเรียบร้อย คืนเงินเต็มจำนวนแล้ว");
      await loadBooking();
    } catch (e: any) {
      console.error("Error reporting guide no-show:", e);
      const errorMsg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "ไม่สามารถรายงานไกด์ไม่มาได้";
      const statusInfo = e?.response?.data?.status
        ? ` (สถานะปัจจุบัน: ${e.response.data.status})`
        : "";
      const dateInfo = e?.response?.data?.start_date
        ? ` วันเริ่มทริป: ${e.response.data.start_date}`
        : "";
      setError(errorMsg + statusInfo + dateInfo);
    } finally {
      setActionLoading(null);
    }
  };

  const confirmUserNoShow = async () => {
    if (!booking) return;
    if (!confirm("ยืนยันว่าคุณไม่มาในวันที่นัดหมาย?")) return;
    setActionLoading("confirm-user-no-show");
    setError("");
    setInfoMessage("");
    try {
      await tripBookingAPI.confirmUserNoShow(Number(bookingId));
      setInfoMessage("ยืนยันว่าลูกค้าไม่มาเรียบร้อย");
      await loadBooking();
    } catch (e) {
      console.error(e);
      setError("ไม่สามารถยืนยันการไม่มาของลูกค้าได้");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => helpers.getStatusColor(status);
  const getStatusText = (status: string) => helpers.getStatusText(status);

  // Timeline helpers
  type StepState = "complete" | "current" | "upcoming";
  const TIMELINE_ORDER = [
    "pending_payment",
    "paid",
    "trip_started",
    "trip_completed",
  ] as const;

  const buildTimelineLocal = (status: string) => buildTimeline(status);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-8">
          <div className="text-lg">กำลังโหลด...</div>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-8">
          <div className="text-lg text-red-600">ไม่พบข้อมูลการจอง</div>
        </div>
      </>
    );
  }

  const status = helpers.getStatus(booking);
  const timeline = buildTimelineLocal(status);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-8 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingHeader
            bookingId={helpers.getId(booking)}
            onBack={() => router.back()}
          />

          <BookingMessages error={error} infoMessage={infoMessage} />

          <div className="space-y-6">
            <BookingStatus
              booking={booking}
              user={user}
              status={status}
              timeline={timeline}
              isOwner={!!isOwner}
              isGuideOwner={!!isGuideOwner}
              paying={paying}
              actionLoading={actionLoading}
              onPayment={handlePayment}
              onConfirmGuideArrival={confirmGuideArrival}
              onConfirmTripComplete={confirmTripComplete}
              onOpenReportNoShow={openReportNoShow}
              onConfirmUserNoShow={confirmUserNoShow}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              getPaymentStatus={helpers.getPaymentStatus}
              getStartDate={helpers.getStartDate}
              getTotal={helpers.getTotal}
              getId={helpers.getId}
            />

            <TripInformation
              booking={booking}
              getTripTitle={helpers.getTripTitle}
              getProvince={helpers.getProvince}
              getTripRequireTitle={helpers.getTripRequireTitle}
              getTripDays={helpers.getTripDays}
            />

            <ContactInformation
              booking={booking}
              getUserName={helpers.getUserName}
              getUserPhone={helpers.getUserPhone}
              getGuideName={helpers.getGuideName}
              getGuidePhone={helpers.getGuidePhone}
            />

            <NotesSection
              booking={booking}
              getSpecialRequests={helpers.getSpecialRequests}
              getNotes={helpers.getNotes}
            />
          </div>
        </div>

        <NoShowModal
          show={showNoShowModal}
          reason={noShowReason}
          actionLoading={actionLoading}
          onReasonChange={setNoShowReason}
          onClose={() => setShowNoShowModal(false)}
          onSubmit={submitReportNoShow}
        />
      </div>
    </>
  );
}
