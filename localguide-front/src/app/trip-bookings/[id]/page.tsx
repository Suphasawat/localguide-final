"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { tripBookingAPI } from "../../lib/api";
import type { TripBooking as TripBookingType } from "../../types";
import Navbar from "@/app/components/Navbar";

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

  // Safe getters for mixed shapes
  const getId = (b: any) => b?.ID ?? b?.id;
  const getStatus = (b: any) => b?.Status ?? b?.status ?? "";
  const getPaymentStatus = (b: any) =>
    b?.PaymentStatus ?? b?.payment_status ?? "";
  const getTotal = (b: any) => b?.TotalAmount ?? b?.total_amount ?? 0;
  const getStartDate = (b: any) => b?.StartDate ?? b?.start_date ?? "";
  const getProvince = (b: any) =>
    b?.TripOffer?.TripRequire?.Province?.Name ??
    b?.province_name ??
    b?.ProvinceName ??
    "-";
  const getTripTitle = (b: any) =>
    b?.TripOffer?.Title ??
    b?.trip_title ??
    b?.TripTitle ??
    `การจอง #${getId(b)}`;
  const getTripRequireTitle = (b: any) =>
    b?.TripOffer?.TripRequire?.Title ?? b?.trip_require_title ?? "-";
  const getTripDays = (b: any) => b?.TripOffer?.TripRequire?.Days ?? "-";
  const getUserName = (b: any) => {
    const u = b?.User;
    if (u?.FirstName || u?.LastName)
      return `${u?.FirstName || ""} ${u?.LastName || ""}`.trim();
    return b?.user_name ?? b?.UserName ?? "-";
  };
  const getGuideName = (b: any) => {
    const g = b?.Guide?.User;
    if (g?.FirstName || g?.LastName)
      return `${g?.FirstName || ""} ${g?.LastName || ""}`.trim();
    return b?.guide_name ?? b?.GuideName ?? "-";
  };
  const getUserPhone = (b: any) => b?.User?.Phone ?? "-";
  const getGuidePhone = (b: any) => b?.Guide?.User?.Phone ?? "-";
  const getSpecialRequests = (b: any) =>
    b?.SpecialRequests ?? b?.special_requests ?? "";
  const getNotes = (b: any) => b?.Notes ?? b?.notes ?? "";
  const getUserIdFromBooking = (b: any) =>
    b?.User?.ID ?? b?.user_id ?? b?.UserID;
  const getGuideIdFromBooking = (b: any) =>
    b?.GuideID ?? b?.guide_id ?? b?.Guide?.User?.ID;

  const isOwner =
    booking && user?.id && getUserIdFromBooking(booking) === user.id;
  const isGuideOwner =
    booking && user?.id && getGuideIdFromBooking(booking) === user.id;

  const handlePayment = async () => {
    if (!booking) return;
    setPaying(true);
    setError("");
    setInfoMessage("");
    try {
      // Create PaymentIntent first to get client_secret for sandbox display
      const resp = await tripBookingAPI.createPayment(Number(bookingId));
      const cs = resp.data?.client_secret;
      const pi = resp.data?.payment_intent_id;
      const amount = resp.data?.amount ?? getTotal(booking);

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
      setError("โปรดระบุเหตุผลในการรายงานลูกค้าไม่มา");
      return;
    }
    setActionLoading("report-no-show");
    setError("");
    setInfoMessage("");
    try {
      await tripBookingAPI.reportUserNoShow(Number(bookingId), {
        reason: noShowReason,
      });
      setShowNoShowModal(false);
      setInfoMessage("รายงานลูกค้าไม่มาเรียบร้อย");
      await loadBooking();
    } catch (e) {
      console.error(e);
      setError("ไม่สามารถรายงานลูกค้าไม่มาได้");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "trip_started":
        return "bg-green-100 text-green-800";
      case "trip_completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "รอชำระเงิน";
      case "paid":
        return "ชำระแล้ว";
      case "trip_started":
        return "เริ่มทริปแล้ว";
      case "trip_completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      case "no_show":
        return "ลูกค้าไม่มา";
      default:
        return status || "-";
    }
  };

  // Timeline helpers
  type StepState = "complete" | "current" | "upcoming";
  const TIMELINE_ORDER = [
    "pending_payment",
    "paid",
    "trip_started",
    "trip_completed",
  ] as const;

  const buildTimeline = (status: string) => {
    let terminal: "cancelled" | "no_show" | undefined;
    let currentIndex = TIMELINE_ORDER.indexOf(status as any);

    if (status === "no_show") {
      terminal = "no_show";
      currentIndex = TIMELINE_ORDER.indexOf("paid");
    } else if (status === "cancelled") {
      terminal = "cancelled";
      // Assume cancellation usually happens before trip started
      currentIndex = Math.max(0, TIMELINE_ORDER.indexOf("pending_payment"));
    }

    if (currentIndex < 0) currentIndex = 0;

    const steps = TIMELINE_ORDER.map((key, idx) => {
      let state: StepState = "upcoming";
      if (status === "trip_completed") {
        state = idx < TIMELINE_ORDER.length - 1 ? "complete" : "current";
      } else if (!terminal) {
        state =
          idx < currentIndex
            ? "complete"
            : idx === currentIndex
            ? "current"
            : "upcoming";
      } else {
        state = idx < currentIndex ? "complete" : "upcoming";
      }
      return { key, label: getStatusText(key), state };
    });

    return { steps, terminal };
  };

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

  const status = getStatus(booking);
  const timeline = buildTimeline(status);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-8 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 text-blue-600 hover:text-blue-800"
            >
              ← กลับ
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              รายละเอียดการจอง
            </h1>
            <p className="mt-2 text-gray-600">
              หมายเลขการจอง: #{getId(booking)}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {infoMessage && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded">
              {infoMessage}
            </div>
          )}

          <div className="space-y-6">
            {/* Booking Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">สถานะการจอง</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">สถานะ</div>
                  <div
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${getStatusColor(
                      status
                    )}`}
                  >
                    {getStatusText(status)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">สถานะการชำระเงิน</div>
                  <div className="mt-1 font-medium">
                    {getPaymentStatus(booking) || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">วันที่เริ่ม</div>
                  <div className="mt-1">{getStartDate(booking) || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">ยอดรวม</div>
                  <div className="mt-1 font-semibold">฿{getTotal(booking)}</div>
                </div>
              </div>

              {status === "pending_payment" && isOwner && (
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                >
                  {paying ? "กำลังสร้างการชำระเงิน..." : "ชำระเงิน"}
                </button>
              )}

              {/* Timeline */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">ไทม์ไลน์สถานะ</h3>
                <ol className="relative border-s border-gray-200 ms-3">
                  {timeline.steps.map((step) => {
                    const color =
                      step.state === "complete"
                        ? "bg-green-600"
                        : step.state === "current"
                        ? "bg-blue-600"
                        : "bg-gray-300";
                    const textColor =
                      step.state === "upcoming"
                        ? "text-gray-500"
                        : "text-gray-900";
                    return (
                      <li key={step.key} className="mb-8 ms-6">
                        <span
                          className={`absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white ${color}`}
                        >
                          {step.state === "complete" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-4 w-4 text-white"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.529-1.652-1.651a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.144-.094l3.474-4.222Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : null}
                        </span>
                        <div className={`font-medium ${textColor}`}>
                          {step.label}
                        </div>
                      </li>
                    );
                  })}
                  {timeline.terminal && (
                    <li className="mb-2 ms-6">
                      <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white bg-red-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4 text-white"
                        >
                          <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-3 9.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" />
                        </svg>
                      </span>
                      <div className="font-medium text-red-700">
                        {timeline.terminal === "cancelled"
                          ? "ยกเลิก"
                          : "ลูกค้าไม่มา"}
                      </div>
                    </li>
                  )}
                </ol>
              </div>

              {/* Trip status management actions */}
              <div className="mt-6 space-x-3">
                {isOwner && status === "paid" && (
                  <button
                    onClick={confirmGuideArrival}
                    disabled={actionLoading === "confirm-arrival"}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
                  >
                    {actionLoading === "confirm-arrival"
                      ? "กำลังยืนยัน..."
                      : "ยืนยันไกด์มาถึงแล้ว"}
                  </button>
                )}

                {isOwner && status === "trip_started" && (
                  <button
                    onClick={confirmTripComplete}
                    disabled={actionLoading === "confirm-complete"}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
                  >
                    {actionLoading === "confirm-complete"
                      ? "กำลังยืนยัน..."
                      : "ยืนยันทริปเสร็จสิ้น"}
                  </button>
                )}

                {isGuideOwner && status === "paid" && (
                  <button
                    onClick={openReportNoShow}
                    disabled={actionLoading === "report-no-show"}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                  >
                    รายงานลูกค้าไม่มา
                  </button>
                )}

                {/* Optional: allow user to confirm no-show after guide report (conservative gating) */}
                {isOwner && status === "paid" && (
                  <button
                    onClick={confirmUserNoShow}
                    disabled={actionLoading === "confirm-user-no-show"}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60"
                  >
                    ยืนยันว่าฉันไม่มา
                  </button>
                )}
              </div>
            </div>

            {/* Trip Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">ข้อมูลทริป</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">ชื่อทริป:</span>{" "}
                  <span className="font-medium">{getTripTitle(booking)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">จังหวัด:</span>{" "}
                  <span className="font-medium">{getProvince(booking)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">
                    หัวข้อความต้องการ:
                  </span>{" "}
                  <span className="font-medium">
                    {getTripRequireTitle(booking)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">จำนวนวัน:</span>{" "}
                  <span className="font-medium">{getTripDays(booking)}</span>
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">ข้อมูลติดต่อ</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">ผู้จอง</div>
                  <div className="font-medium">{getUserName(booking)}</div>
                  <div className="text-sm text-gray-600">
                    โทร: {getUserPhone(booking)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">ไกด์</div>
                  <div className="font-medium">{getGuideName(booking)}</div>
                  <div className="text-sm text-gray-600">
                    โทร: {getGuidePhone(booking)}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(getSpecialRequests(booking) || getNotes(booking)) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">หมายเหตุ</h2>
                {getSpecialRequests(booking) && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">
                      ความต้องการพิเศษ:
                    </span>{" "}
                    {getSpecialRequests(booking)}
                  </div>
                )}
                {getNotes(booking) && (
                  <div>
                    <span className="text-sm text-gray-500">โน้ต:</span>{" "}
                    {getNotes(booking)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Report No-Show Modal */}
        {showNoShowModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-3">รายงานลูกค้าไม่มา</h3>
              <p className="text-sm text-gray-600 mb-3">
                โปรดระบุเหตุผลหรือรายละเอียดเพิ่มเติม
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
                rows={4}
                value={noShowReason}
                onChange={(e) => setNoShowReason(e.target.value)}
                placeholder="รายละเอียด..."
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNoShowModal(false)}
                  className="px-4 py-2 text-sm rounded-md border"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={submitReportNoShow}
                  disabled={actionLoading === "report-no-show"}
                  className="px-4 py-2 text-sm rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                >
                  {actionLoading === "report-no-show"
                    ? "กำลังส่ง..."
                    : "ส่งรายงาน"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
