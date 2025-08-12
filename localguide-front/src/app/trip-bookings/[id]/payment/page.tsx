"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FaCalendarAlt,
  FaUser,
  FaCreditCard,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { getUser } from "../../../services/auth.service";
import {
  tripService,
  TripBooking,
  TripPayment,
} from "../../../services/trip.service";

dayjs.locale("th");

export default function TripPaymentPage() {
  const [booking, setBooking] = useState<TripBooking | null>(null);
  const [payment, setPayment] = useState<TripPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");

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
      const bookingData = await tripService.getTripBooking(bookingId);
      setBooking(bookingData);

      // Check if payment already exists
      if (bookingData.Status === "pending_payment") {
        // Create payment intent
        const paymentData = await tripService.createTripPayment(bookingId);
        setPayment(paymentData.payment);
        setClientSecret(paymentData.client_secret);
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!payment || !clientSecret) {
      setError("ไม่พบข้อมูลการชำระเงิน");
      return;
    }

    setProcessing(true);
    try {
      // จำลองการชำระเงินผ่าน Stripe
      // ในการใช้งานจริงต้องใช้ Stripe Elements
      await new Promise((resolve) => setTimeout(resolve, 2000)); // จำลองการรอ

      // Confirm payment
      await tripService.confirmTripPayment(
        bookingId,
        payment.StripePaymentIntentID
      );

      alert("ชำระเงินสำเร็จ! คุณจะถูกนำไปยังหน้าการจอง");
      router.push("/my-bookings");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการชำระเงิน");
    } finally {
      setProcessing(false);
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

  if (booking.Status !== "pending_payment") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            การชำระเงินเสร็จสิ้นแล้ว
          </h3>
          <p className="text-gray-500 mb-6">
            การจองของคุณได้รับการชำระเงินเรียบร้อยแล้ว
          </p>
          <button
            onClick={() => router.push("/my-bookings")}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            ดูการจองของฉัน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ชำระเงิน</h1>
          <p className="mt-2 text-gray-600">
            กรุณาชำระเงินเพื่อยืนยันการจองของคุณ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                สรุปการจอง
              </h2>

              {/* Trip Offer Info */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">
                  {booking.TripOffer.Title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {booking.TripOffer.Description}
                </p>
              </div>

              {/* Guide Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {booking.Guide.User.FirstName} {booking.Guide.User.LastName}
                  </h4>
                  <p className="text-sm text-gray-500">ไกด์ท้องถิ่น</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-blue-500" />
                    <span className="text-gray-600">วันที่เที่ยว</span>
                  </div>
                  <span className="font-medium">
                    {dayjs(booking.StartDate).format("DD/MM/YYYY")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MdAttachMoney className="text-green-500" />
                    <span className="text-gray-600">ราคารวม</span>
                  </div>
                  <span className="font-medium">
                    ฿{booking.TotalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Terms Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">
                  ข้อมูลการชำระเงิน
                </h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• คุณจ่ายเงิน 100% ล่วงหน้า</li>
                  <li>• ไกด์จะได้รับเงิน 50% เมื่อคุณยืนยันว่าไกด์มาแล้ว</li>
                  <li>• ไกด์จะได้รับเงินอีก 50% เมื่อทริปเสร็จสิ้น</li>
                  <li>• หากคุณไม่ไป จะคืนเงิน 50% ให้คุณ</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaCreditCard className="mr-2 text-blue-500" />
                ชำระเงิน
              </h2>

              {/* Amount */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-green-800">
                    ยอดรวม
                  </span>
                  <span className="text-2xl font-bold text-green-800">
                    ฿{booking.TotalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วิธีการชำระเงิน
                </label>
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FaCreditCard className="text-blue-500" />
                    <span className="font-medium">บัตรเครดิต/เดบิต</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    ชำระเงินผ่าน Stripe อย่างปลอดภัย
                  </p>
                </div>
              </div>

              {/* Mock Payment Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หมายเลขบัตร
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันหมดอายุ
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อบนบัตร
                  </label>
                  <input
                    type="text"
                    placeholder="JOHN DOE"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg flex items-center space-x-2">
                <FaLock className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  การชำระเงินของคุณปลอดภัยด้วย SSL encryption
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังประมวลผล...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" />
                      ชำระเงิน ฿{booking.TotalAmount.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
