"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Cookies from "js-cookie";
import Navbar from "@/app/components/Navbar";

export default function CreateReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [rating, setRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [knowledgeRating, setKnowledgeRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchBookingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, isAuthenticated, authLoading]);

  const fetchBookingDetails = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/trip-bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        Cookies.remove("token");
        router.push("/auth/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);

        // ตรวจสอบว่าทริปเสร็จสิ้นแล้วหรือยัง
        if (data.booking.status !== "trip_completed") {
          setError("สามารถรีวิวได้เฉพาะทริปที่เสร็จสิ้นแล้วเท่านั้น");
        }

        // ตรวจสอบว่าเคยรีวิวแล้วหรือยัง
        if (data.booking.has_review) {
          setError("คุณได้เขียนรีวิวทริปนี้แล้ว");
        }
      } else {
        setError("ไม่พบข้อมูลการจอง");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      alert("กรุณาเขียนความคิดเห็น");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = Cookies.get("token");
      const response = await fetch("http://localhost:8080/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trip_booking_id: parseInt(bookingId),
          rating,
          service_rating: serviceRating,
          knowledge_rating: knowledgeRating,
          communication_rating: communicationRating,
          punctuality_rating: punctualityRating,
          comment,
          is_anonymous: isAnonymous,
          images: "",
        }),
      });

      if (response.ok) {
        alert("✅ ส่งรีวิวเรียบร้อยแล้ว ขอบคุณสำหรับรีวิวของคุณ!");
        router.push(`/trip-bookings/${bookingId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "เกิดข้อผิดพลาดในการส่งรีวิว");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("เกิดข้อผิดพลาดในการส่งรีวิว");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="text-3xl transition-transform hover:scale-110"
          >
            {star <= value ? "⭐" : "☆"}
          </button>
        ))}
        <span className="ml-3 text-gray-600 font-medium">{value} / 5</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </>
    );
  }

  if (!booking || error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center pt-16">
          <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {error || "ไม่พบข้อมูลการจอง"}
            </h2>
            <p className="text-gray-600 mb-6">
              กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง
            </p>
            <button
              onClick={() => router.push("/bookings")}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              กลับไปหน้ารายการจอง
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-12 pt-24">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2"
            >
              ← กลับ
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              รีวิวการเดินทาง
            </h1>
            <p className="text-gray-600 mt-2">
              แบ่งปันประสบการณ์การท่องเที่ยวของคุณ
            </p>
          </div>

          {/* Booking Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0">
                {booking.guide_name?.[0] || "G"}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {booking.guide_name || "ไกด์"}
                </h3>
                <p className="text-gray-700 font-medium">
                  {booking.trip_title || "ทริป"}
                </p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span>📍 {booking.province_name || ""}</span>
                  <span>•</span>
                  <span>
                    📅{" "}
                    {booking.start_date
                      ? new Date(booking.start_date).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              ให้คะแนนและความคิดเห็น
            </h2>

            {/* Overall Rating */}
            <StarRating
              value={rating}
              onChange={setRating}
              label="⭐ คะแนนรวม"
            />

            {/* Service Rating */}
            <StarRating
              value={serviceRating}
              onChange={setServiceRating}
              label="🎯 การบริการ"
            />

            {/* Knowledge Rating */}
            <StarRating
              value={knowledgeRating}
              onChange={setKnowledgeRating}
              label="📚 ความรู้"
            />

            {/* Communication Rating */}
            <StarRating
              value={communicationRating}
              onChange={setCommunicationRating}
              label="💬 การสื่อสาร"
            />

            {/* Punctuality Rating */}
            <StarRating
              value={punctualityRating}
              onChange={setPunctualityRating}
              label="⏰ ความตรงต่อเวลา"
            />

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ความคิดเห็น *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="เขียนรีวิวของคุณที่นี่... เช่น ประสบการณ์การท่องเที่ยว บริการของไกด์ จุดเด่นของทริป"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                ช่วยนักท่องเที่ยวคนอื่นโดยการแบ่งปันประสบการณ์ของคุณ
              </p>
            </div>

            {/* Anonymous Option */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-gray-700">รีวิวแบบไม่ระบุชื่อ</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "กำลังส่งรีวิว..." : "ส่งรีวิว"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
