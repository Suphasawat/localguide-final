"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FaCalendarAlt,
  FaUser,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import { MdDescription } from "react-icons/md";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { getUser } from "../../services/auth.service";
import { tripService, TripBooking } from "../../services/trip.service";

dayjs.locale("th");

export default function TripBookingDetailPage() {
  const [booking, setBooking] = useState<TripBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();
  const params = useParams();
  const user = getUser();
  const bookingId = parseInt(params.id as string);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadBookingDetail();
  }, [bookingId]);

  const loadBookingDetail = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripBooking(bookingId);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmGuideArrival = async () => {
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ที่จะยืนยันว่าไกด์มาแล้ว? เงิน 50% จะถูกจ่ายให้ไกด์ทันที"
      )
    ) {
      return;
    }

    try {
      await tripService.confirmGuideArrival(bookingId);
      await loadBookingDetail();
      alert("ยืนยันไกด์มาแล้วสำเร็จ เงิน 50% ได้จ่ายให้ไกด์แล้ว");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการยืนยัน");
    }
  };

  const handleConfirmTripComplete = async () => {
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ที่จะยืนยันว่าทริปเสร็จสิ้นแล้ว? เงินส่วนที่เหลือจะถูกจ่ายให้ไกด์ทันที"
      )
    ) {
      return;
    }

    try {
      await tripService.confirmTripComplete(bookingId);
      await loadBookingDetail();
      alert("ยืนยันทริปเสร็จสิ้นแล้ว เงินส่วนที่เหลือได้จ่ายให้ไกด์แล้ว");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการยืนยัน");
    }
  };

  const handleConfirmNoShow = async () => {
    if (
      !confirm(
        "คุณยืนยันว่าคุณไม่ได้ไปทริปนี้จริงหรือ? เงิน 50% จะถูกจ่ายให้ไกด์ และคืนเงิน 50% ให้คุณ"
      )
    ) {
      return;
    }

    try {
      await tripService.confirmUserNoShow(bookingId);
      await loadBookingDetail();
      alert("ยืนยันว่าไม่ได้ไปแล้ว เงิน 50% จ่ายให้ไกด์ และคืนเงิน 50% ให้คุณ");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการยืนยัน");
    }
  };

  const handleDisputeNoShow = async () => {
    const reason = prompt("เหตุผลที่คัดค้าน:");
    const description = prompt("รายละเอียดเพิ่มเติม:");

    if (!reason || !description) {
      alert("กรุณาใส่เหตุผลและรายละเอียด");
      return;
    }

    try {
      await tripService.disputeNoShowReport(bookingId, { reason, description });
      await loadBookingDetail();
      alert("ส่งคำคัดค้านแล้ว รอ admin ตัดสิน");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการคัดค้าน");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "trip_started":
        return "bg-purple-100 text-purple-800";
      case "trip_completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show_reported":
        return "bg-orange-100 text-orange-800";
      case "no_show_disputed":
        return "bg-indigo-100 text-indigo-800";
      case "no_show_confirmed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_payment":
        return "รอชำระเงิน";
      case "paid":
        return "ชำระเงินแล้ว";
      case "trip_started":
        return "เริ่มทริปแล้ว";
      case "trip_completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิกแล้ว";
      case "no_show_reported":
        return "ไกด์รีพอร์ตไม่มา";
      case "no_show_disputed":
        return "คัดค้านการรีพอร์ต";
      case "no_show_confirmed":
        return "ยืนยันไม่ได้ไป";
      default:
        return status;
    }
  };

  const parseJsonSafely = (jsonString: string, fallback: any = []) => {
    try {
      return JSON.parse(jsonString || "[]");
    } catch {
      return fallback;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadBookingDetail}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  const isUserBooking = user?.id === booking.UserID;
  const isGuideBooking = user?.id === booking.GuideID;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-amber-600 hover:text-amber-700 mb-4"
          >
            ← กลับ
          </button>
          <h1 className="text-3xl font-bold text-gray-900">รายละเอียดการจอง</h1>
          <p className="mt-2 text-gray-600">หมายเลขการจอง #{booking.ID}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Offer Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                รายละเอียดทริป
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {booking.TripOffer.Title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {booking.TripOffer.Description}
                </p>
              </div>

              {/* Itinerary */}
              {booking.TripOffer.Itinerary && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">
                    กำหนดการเที่ยว
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {typeof booking.TripOffer.Itinerary === "string"
                        ? booking.TripOffer.Itinerary
                        : JSON.stringify(
                            parseJsonSafely(booking.TripOffer.Itinerary),
                            null,
                            2
                          )}
                    </pre>
                  </div>
                </div>
              )}

              {/* Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {booking.TripOffer.IncludedServices && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      บริการที่รวม
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {parseJsonSafely(booking.TripOffer.IncludedServices).map(
                        (service: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <FaCheckCircle className="text-green-500 text-xs" />
                            <span>{service}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {booking.TripOffer.ExcludedServices && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      บริการที่ไม่รวม
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {parseJsonSafely(booking.TripOffer.ExcludedServices).map(
                        (service: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <FaTimesCircle className="text-red-500 text-xs" />
                            <span>{service}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Guide/User Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {isUserBooking ? "ข้อมูลไกด์" : "ข้อมูลลูกค้า"}
              </h2>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-amber-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {isUserBooking
                      ? `${booking.Guide.User.FirstName} ${booking.Guide.User.LastName}`
                      : `${booking.User.FirstName} ${booking.User.LastName}`}
                  </h3>
                  <p className="text-gray-500">
                    {isUserBooking ? "ไกด์ท้องถิ่น" : "ลูกค้า"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {(booking.SpecialRequests || booking.Notes) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  ข้อมูลเพิ่มเติม
                </h2>

                {booking.SpecialRequests && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      ความต้องการพิเศษ
                    </h4>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">
                      {booking.SpecialRequests}
                    </p>
                  </div>
                )}

                {booking.Notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">หมายเหตุ</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {booking.Notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Dates */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">สถานะการจอง</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">สถานะ</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      booking.Status
                    )}`}
                  >
                    {getStatusText(booking.Status)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">วันที่เที่ยว</span>
                  <span className="font-medium">
                    {dayjs(booking.StartDate).format("DD/MM/YYYY")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">ราคารวม</span>
                  <span className="text-lg font-semibold text-green-600">
                    ฿{booking.TotalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">สถานะการชำระ</span>
                  <span className="text-sm font-medium">
                    {booking.PaymentStatus === "pending" && "รอชำระ"}
                    {booking.PaymentStatus === "paid" && "ชำระแล้ว"}
                    {booking.PaymentStatus === "first_released" && "จ่าย 50%"}
                    {booking.PaymentStatus === "fully_released" && "จ่ายครบ"}
                    {booking.PaymentStatus === "partially_refunded" &&
                      "คืนบางส่วน"}
                  </span>
                </div>

                {booking.TripStartedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">เริ่มทริป</span>
                    <span className="text-sm">
                      {dayjs(booking.TripStartedAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </div>
                )}

                {booking.TripCompletedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">เสร็จสิ้น</span>
                    <span className="text-sm">
                      {dayjs(booking.TripCompletedAt).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions for User */}
            {isUserBooking && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  การดำเนินการ
                </h3>

                <div className="space-y-3">
                  {/* Payment Button */}
                  {booking.Status === "pending_payment" && (
                    <button
                      onClick={() =>
                        router.push(`/trip-bookings/${booking.ID}/payment`)
                      }
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      ชำระเงิน
                    </button>
                  )}

                  {/* Confirm Guide Arrival */}
                  {booking.Status === "paid" && (
                    <>
                      <button
                        onClick={handleConfirmGuideArrival}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                      >
                        <FaCheckCircle className="mr-2" />
                        ยืนยันไกด์มาแล้ว
                      </button>
                      <button
                        onClick={handleConfirmNoShow}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center"
                      >
                        <FaTimesCircle className="mr-2" />
                        ฉันไม่ได้ไป
                      </button>
                    </>
                  )}

                  {/* Confirm Trip Complete */}
                  {booking.Status === "trip_started" && (
                    <button
                      onClick={handleConfirmTripComplete}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center"
                    >
                      <FaCheckCircle className="mr-2" />
                      ยืนยันทริปเสร็จ
                    </button>
                  )}

                  {/* Dispute No Show Report */}
                  {booking.Status === "no_show_reported" && (
                    <button
                      onClick={handleDisputeNoShow}
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center"
                    >
                      <FaExclamationTriangle className="mr-2" />
                      คัดค้านการรีพอร์ต
                    </button>
                  )}

                  {/* Write Review */}
                  {booking.Status === "trip_completed" && (
                    <button
                      onClick={() =>
                        router.push(`/guides/${booking.GuideID}?review=true`)
                      }
                      className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                      เขียนรีวิว
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Actions for Guide */}
            {isGuideBooking && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  การดำเนินการ
                </h3>

                <div className="space-y-3">
                  {booking.Status === "paid" && (
                    <button
                      onClick={() => {
                        if (
                          confirm("คุณต้องการรีพอร์ตว่าลูกค้าไม่มาใช่หรือไม่?")
                        ) {
                          tripService.reportUserNoShow(booking.ID);
                        }
                      }}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center"
                    >
                      <FaExclamationTriangle className="mr-2" />
                      รีพอร์ตลูกค้าไม่มา
                    </button>
                  )}

                  <button
                    onClick={() => router.push("/my-bookings")}
                    className="w-full px-4 py-2 text-amber-600 border border-amber-600 rounded-lg hover:bg-amber-50"
                  >
                    ดูการจองทั้งหมด
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
