"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReviewCard from "@/app/components/reviews/ReviewCard";

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/my-reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("ลบรีวิวเรียบร้อยแล้ว");
        fetchMyReviews();
      } else {
        alert("เกิดข้อผิดพลาดในการลบรีวิว");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("เกิดข้อผิดพลาดในการลบรีวิว");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">รีวิวของฉัน</h1>
          <p className="text-gray-600">รีวิวที่คุณได้เขียนไว้ทั้งหมด</p>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 text-lg mb-2">คุณยังไม่มีรีวิว</p>
            <p className="text-gray-500 text-sm">
              หลังจากเดินทางเสร็จสิ้น คุณสามารถเขียนรีวิวให้ไกด์ได้
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="relative">
                <ReviewCard review={review} />

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="ลบรีวิว"
                  >
                    <span>🗑️</span>
                  </button>
                </div>

                {/* Guide Info */}
                {review.guide && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">รีวิวสำหรับ:</p>
                    <p className="font-semibold text-gray-900">
                      {review.guide.user?.first_name}{" "}
                      {review.guide.user?.last_name}
                    </p>
                    {review.trip_booking && (
                      <p className="text-sm text-gray-500">
                        {new Date(
                          review.trip_booking.trip_date
                        ).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
