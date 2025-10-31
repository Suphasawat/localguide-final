"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { tripBookingAPI, uploadAPI } from "../../lib/api";
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

type ConfirmActionKey = "arrival" | "complete" | "user_no_show" | null;

export default function TripBookingDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<TripBookingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [noShowReason, setNoShowReason] = useState("");
  // 🆕 เพิ่ม state สำหรับระบุว่า modal เป็นการรายงานแบบไหน
  const [noShowReportType, setNoShowReportType] = useState<"guide" | "user">(
    "guide"
  );
  const [infoMessage, setInfoMessage] = useState("");

  // 🆕 State สำหรับอัปโหลดรูปหลักฐานสำหรับ no-show report
  const [noShowEvidenceFile, setNoShowEvidenceFile] = useState<File | null>(
    null
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTone, setConfirmTone] = useState<"info" | "success" | "error">(
    "info"
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmActionKey>(null);

  // 🆕 State สำหรับ dispute modal
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeEvidenceFile, setDisputeEvidenceFile] = useState<File | null>(
    null
  );

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
  }, [isAuthenticated, bookingId]);

  const loadBooking = async () => {
    try {
      const response = await tripBookingAPI.getById(Number(bookingId));
      const data = response.data?.booking ?? response.data;
      setBooking(data || null);
    } catch (_error) {
      console.error("Failed to load booking:", _error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const isOwner =
    booking && user?.id && helpers.getUserIdFromBooking(booking) === user.id;

  // Use helper to obtain guide user id (handles various shapes)
  // Prefer several known shapes returned by backend. Try in order:
  // 1) booking.Guide.UserID
  // 2) booking.Guide.User.id
  // 3) booking.guide_user_id / booking.GuideUserID / booking.guideUserId
  // 4) fallback to helpers.getGuideIdFromBooking
  let guideUserId: number | undefined = undefined;
  if (booking) {
    const b: any = booking;
    guideUserId =
      b?.Guide?.UserID ??
      b?.Guide?.User?.id ??
      b?.guide_user_id ??
      b?.GuideUserID ??
      b?.guideUserId ??
      undefined;
    if (!guideUserId) {
      // final fallback
      guideUserId = helpers.getGuideIdFromBooking(booking) as
        | number
        | undefined;
    }
  }
  const isGuideOwner = !!(booking && user?.id && guideUserId === user.id);

  const handlePayment = async () => {
    if (!booking) {
      return;
    }
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

  const openConfirmGuideArrival = () => {
    setConfirmTitle("ยืนยันว่าไกด์ได้มาถึงแล้ว?");
    setConfirmMessage("การยืนยันนี้จะแจ้งสถานะให้ทั้งสองฝ่ายทราบ");
    setConfirmTone("info");
    setConfirmAction("arrival");
    setConfirmOpen(true);
  };

  const openConfirmTripComplete = () => {
    setConfirmTitle("ยืนยันว่าทริปเสร็จสิ้นแล้ว?");
    setConfirmMessage("การยืนยันนี้จะทำให้ทริปเข้าสู่สถานะเสร็จสิ้น");
    setConfirmTone("success");
    setConfirmAction("complete");
    setConfirmOpen(true);
  };

  const openConfirmUserNoShow = () => {
    setConfirmTitle("ยืนยันว่าคุณไม่มาในวันที่นัดหมาย?");
    setConfirmMessage(
      "หากยืนยัน ระบบจะบันทึกว่าคุณไม่ได้เข้าร่วมทริปตามกำหนด และดำเนินการตามขั้นตอนของแพลตฟอร์ม"
    );
    setConfirmTone("error");
    setConfirmAction("user_no_show");
    setConfirmOpen(true);
  };

  const doConfirmGuideArrival = async () => {
    if (!booking) {
      return;
    }
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
      setConfirmOpen(false);
    }
  };

  const doConfirmTripComplete = async () => {
    if (!booking) {
      return;
    }
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
      setConfirmOpen(false);
    }
  };

  const doConfirmUserNoShow = async () => {
    if (!booking) {
      return;
    }
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
      setConfirmOpen(false);
    }
  };

  // 🆕 เปิด modal สำหรับลูกค้ารายงานไกด์ไม่มา
  const openReportGuideNoShow = () => {
    setNoShowReason("");
    setNoShowEvidenceFile(null);
    setNoShowReportType("guide");
    setShowNoShowModal(true);
  };

  // 🆕 เปิด modal สำหรับไกด์รายงานลูกค้าไม่มา
  const openReportUserNoShow = () => {
    setNoShowReason("");
    setNoShowEvidenceFile(null);
    setNoShowReportType("user");
    setShowNoShowModal(true);
  };

  const submitReportNoShow = async () => {
    if (!booking) {
      return;
    }
    if (!noShowReason.trim()) {
      setError(
        `โปรดระบุเหตุผลในการรายงาน${
          noShowReportType === "guide" ? "ไกด์" : "ลูกค้า"
        }ไม่มา`
      );
      return;
    }

    const actionKey =
      noShowReportType === "guide"
        ? "report-guide-no-show"
        : "report-user-no-show";
    setActionLoading(actionKey);
    setError("");
    setInfoMessage("");

    try {
      // 🆕 อัปโหลดรูปหลักฐานก่อนส่งรายงาน (ถ้ามี)
      let evidenceUrl = "";
      if (noShowEvidenceFile) {
        try {
          const uploadResponse = await uploadAPI.uploadFile(noShowEvidenceFile);
          evidenceUrl =
            uploadResponse.data?.url || uploadResponse.data?.path || "";
        } catch (uploadErr: any) {
          console.error("Upload error:", uploadErr);
          throw new Error(
            uploadErr?.response?.data?.error || "ไม่สามารถอัปโหลดไฟล์หลักฐานได้"
          );
        }
      }

      // 🆕 เรียก API ตามประเภทการรายงาน
      if (noShowReportType === "guide") {
        await tripBookingAPI.reportGuideNoShow(Number(bookingId), {
          reason: noShowReason,
          description: noShowReason,
          evidence: evidenceUrl,
        });
        setInfoMessage("รายงานไกด์ไม่มาเรียบร้อย คืนเงินเต็มจำนวนแล้ว");
      } else {
        await tripBookingAPI.reportUserNoShow(Number(bookingId), {
          reason: noShowReason,
          description: noShowReason,
          evidence: evidenceUrl,
        });
        setInfoMessage("รายงานลูกค้าไม่มาเรียบร้อย");
      }
      setShowNoShowModal(false);
      await loadBooking();
    } catch (e: any) {
      console.error(`Error reporting ${noShowReportType} no-show:`, e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        `ไม่สามารถรายงาน${
          noShowReportType === "guide" ? "ไกด์" : "ลูกค้า"
        }ไม่มาได้`;
      const statusInfo = e?.response?.data?.status
        ? ` (สถานะปัจจุบัน: ${e.response.data.status})`
        : "";
      const dateInfo = e?.response?.data?.start_date
        ? ` วันเริ่มทริป: ${e.response.data.start_date}`
        : "";
      setError(msg + statusInfo + dateInfo);
    } finally {
      setActionLoading(null);
    }
  };

  // 🆕 ฟังก์ชันสำหรับเปิด dispute modal
  const openDisputeModal = () => {
    setDisputeReason("");
    setDisputeDescription("");
    setDisputeEvidenceFile(null);
    setShowDisputeModal(true);
  };

  // 🆕 ฟังก์ชันสำหรับส่งข้อมูลการโต้แย้ง
  const submitDispute = async () => {
    if (!booking) return;
    if (!disputeReason.trim()) {
      setError("โปรดระบุเหตุผลที่โต้แย้ง");
      return;
    }
    setActionLoading("dispute-no-show");
    setError("");
    setInfoMessage("");
    try {
      // If there's an evidence file, upload it first to server static storage endpoint
      let evidenceUrl = "";
      if (disputeEvidenceFile) {
        try {
          const uploadResponse = await uploadAPI.uploadFile(
            disputeEvidenceFile
          );
          evidenceUrl =
            uploadResponse.data?.url || uploadResponse.data?.path || "";
        } catch (uploadErr: any) {
          console.error("Upload error:", uploadErr);
          throw new Error(
            uploadErr?.response?.data?.error || "ไม่สามารถอัปโหลดไฟล์หลักฐานได้"
          );
        }
      }

      const payload = {
        reason: disputeReason,
        description: disputeDescription,
        evidence: evidenceUrl,
      };

      await tripBookingAPI.disputeNoShow(Number(bookingId), payload);
      setInfoMessage(
        "โต้แย้งการรีพอร์ตเรียบร้อยแล้ว Admin จะพิจารณาภายใน 24-48 ชั่วโมง"
      );
      setShowDisputeModal(false);
      await loadBooking();
    } catch (e: any) {
      console.error("Failed to submit dispute:", e);
      const msg =
        e?.response?.data?.error || e?.message || "ไม่สามารถโต้แย้งได้";
      setError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => helpers.getStatusColor(status);
  const getStatusText = (status: string) => helpers.getStatusText(status);

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
  const timeline = useBookingTimeline(helpers.getStatusText).buildTimeline(
    status
  );

  let confirmToneBar = "bg-emerald-600";
  if (confirmTone === "error") {
    confirmToneBar = "bg-red-600";
  }
  if (confirmTone === "info") {
    confirmToneBar = "bg-amber-600";
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-8 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingHeader
            bookingId={helpers.getId(booking)}
            onBack={() => {
              router.back();
            }}
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
              onConfirmGuideArrival={openConfirmGuideArrival}
              onConfirmTripComplete={openConfirmTripComplete}
              onOpenReportNoShow={openReportGuideNoShow}
              onConfirmUserNoShow={openConfirmUserNoShow}
              onOpenReportUserNoShow={openReportUserNoShow}
              onOpenDispute={openDisputeModal}
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
          reportType={noShowReportType}
          evidenceFile={noShowEvidenceFile}
          onEvidenceFileChange={setNoShowEvidenceFile}
          onReasonChange={setNoShowReason}
          onClose={() => {
            setShowNoShowModal(false);
          }}
          onSubmit={submitReportNoShow}
        />

        {/* Dispute Modal */}
        {showDisputeModal ? (
          <div className="fixed inset-0 z-[110] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => {
                // click outside to close
                setShowDisputeModal(false);
              }}
            />
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
              <h3 className="text-lg font-semibold">โต้แย้งการรีพอร์ต</h3>
              <p className="text-sm text-gray-600 mt-2">
                กรุณาระบุเหตุผลและแนบหลักฐาน (ถ้ามี)
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    เหตุผล
                  </label>
                  <input
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    รายละเอียดเพิ่มเติม
                  </label>
                  <textarea
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    หลักฐาน (รูปภาพ)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setDisputeEvidenceFile(e.target.files?.[0] ?? null)
                    }
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-50 file:text-purple-700
                      hover:file:bg-purple-100"
                  />
                  {disputeEvidenceFile && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">
                        เลือกแล้ว: {disputeEvidenceFile.name}
                      </p>
                      <img
                        src={URL.createObjectURL(disputeEvidenceFile)}
                        alt="Preview"
                        className="max-w-full h-auto max-h-48 rounded border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={submitDispute}
                  disabled={actionLoading === "dispute-no-show"}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {actionLoading === "dispute-no-show"
                    ? "กำลังส่ง..."
                    : "ส่งโต้แย้ง"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => {}} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className={`${confirmToneBar} h-2 rounded-t-2xl`} />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {confirmTitle}
              </h3>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                {confirmMessage}
              </p>
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={actionLoading !== null}
                  onClick={() => {
                    setConfirmOpen(false);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={actionLoading !== null}
                  onClick={() => {
                    if (confirmAction === "arrival") {
                      doConfirmGuideArrival();
                    } else if (confirmAction === "complete") {
                      doConfirmTripComplete();
                    } else if (confirmAction === "user_no_show") {
                      doConfirmUserNoShow();
                    }
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                    confirmTone === "error"
                      ? "bg-red-600 hover:bg-red-700"
                      : confirmTone === "success"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {actionLoading ? "กำลังดำเนินการ..." : "ยืนยัน"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
