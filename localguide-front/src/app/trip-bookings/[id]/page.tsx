"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { tripBookingAPI } from "../../lib/api";

interface TripBooking {
  ID: number;
  StartDate: string;
  TotalAmount: number;
  Status: string;
  PaymentStatus: string;
  SpecialRequests?: string;
  Notes?: string;
  User: {
    FirstName: string;
    LastName: string;
    Phone: string;
  };
  Guide: {
    User: {
      FirstName: string;
      LastName: string;
      Phone: string;
    };
  };
  TripOffer: {
    Title: string;
    Description: string;
    Itinerary?: string;
    IncludedServices?: string;
    ExcludedServices?: string;
    TripRequire: {
      Title: string;
      Days: number;
      Province: {
        Name: string;
      };
    };
  };
}

export default function TripBookingDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<TripBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, [user, isAuthenticated, bookingId, router]);

  const loadBooking = async () => {
    try {
      const response = await tripBookingAPI.getById(Number(bookingId));
      setBooking(response.data);
    } catch (error) {
      console.error("Failed to load booking:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const response = await tripBookingAPI.createPayment(Number(bookingId));
      // Redirect to Stripe or handle payment
      if (response.data?.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างลิงก์ชำระเงิน");
      }
    } catch (error) {
      console.error("Failed to create payment:", error);
      alert("ไม่สามารถสร้างลิงก์ชำระเงินได้");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">ไม่พบข้อมูลการจอง</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            ← กลับ
          </button>
          <h1 className="text-3xl font-bold text-gray-900">รายละเอียดการจอง</h1>
          <p className="mt-2 text-gray-600">หมายเลขการจอง: #{booking.ID}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Booking Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">สถานะการจอง</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">สถานะ:</span>
                <p className="font-medium">{booking.Status}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">สถานะชำระเงิน:</span>
                <p className="font-medium">{booking.PaymentStatus}</p>
              </div>
            </div>
          </div>

          {/* Trip Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">ข้อมูลทริป</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">
                  {booking.TripOffer?.Title}
                </h3>
                <p className="text-gray-600">
                  {booking.TripOffer?.TripRequire?.Title}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  📍 จังหวัด: {booking.TripOffer?.TripRequire?.Province?.Name}
                </div>
                <div>
                  📅 ระยะเวลา: {booking.TripOffer?.TripRequire?.Days} วัน
                </div>
                <div>
                  🗓️ วันเริ่มทริป:{" "}
                  {new Date(booking.StartDate).toLocaleDateString("th-TH")}
                </div>
                <div>
                  💰 ราคารวม: {booking.TotalAmount?.toLocaleString()} บาท
                </div>
              </div>

              {booking.TripOffer?.Description && (
                <div>
                  <h4 className="font-medium mb-2">รายละเอียดแพ็กเกจ:</h4>
                  <p className="text-gray-600">
                    {booking.TripOffer.Description}
                  </p>
                </div>
              )}

              {booking.TripOffer?.Itinerary && (
                <div>
                  <h4 className="font-medium mb-2">กำหนดการเที่ยว:</h4>
                  <pre className="text-gray-600 whitespace-pre-wrap">
                    {booking.TripOffer.Itinerary}
                  </pre>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {booking.TripOffer?.IncludedServices && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">
                      บริการที่รวม:
                    </h4>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {booking.TripOffer.IncludedServices}
                    </pre>
                  </div>
                )}

                {booking.TripOffer?.ExcludedServices && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">
                      บริการที่ไม่รวม:
                    </h4>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {booking.TripOffer.ExcludedServices}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">ข้อมูลติดต่อ</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">ลูกค้า</h3>
                <div className="text-sm space-y-1">
                  <div>
                    👤 {booking.User?.FirstName} {booking.User?.LastName}
                  </div>
                  <div>📞 {booking.User?.Phone}</div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">ไกด์</h3>
                <div className="text-sm space-y-1">
                  <div>
                    👤 {booking.Guide?.User?.FirstName}{" "}
                    {booking.Guide?.User?.LastName}
                  </div>
                  <div>📞 {booking.Guide?.User?.Phone}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.SpecialRequests && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">ความต้องการพิเศษ</h2>
              <p className="text-gray-600">{booking.SpecialRequests}</p>
            </div>
          )}

          {/* Action Buttons */}
          {booking.Status === "pending_payment" &&
            user?.Role?.Name === "user" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">ชำระเงิน</h2>
                <p className="text-gray-600 mb-4">
                  กรุณาชำระเงินจำนวน {booking.TotalAmount?.toLocaleString()} บาท
                  เพื่อยืนยันการจอง
                </p>
                <button
                  onClick={handlePayment}
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
                >
                  ชำระเงินผ่าน Stripe
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
