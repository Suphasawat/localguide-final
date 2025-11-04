"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { reviewAPI } from "@/app/lib/api";

export default function ReviewableBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewableBookings();
  }, []);

  const fetchReviewableBookings = async () => {
    try {
      const response = await reviewAPI.getReviewableBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Error fetching reviewable bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              เขียนรีวิว
            </h1>
            <p className="text-gray-600">
              ทริปที่เสร็จสิ้นแล้วและยังไม่ได้เขียนรีวิว
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">⭐</div>
              <p className="text-gray-600 text-lg mb-2">
                ไม่มีทริปที่ต้องเขียนรีวิว
              </p>
              <p className="text-gray-500 text-sm">
                เมื่อทริปของคุณเสร็จสิ้น คุณสามารถเขียนรีวิวให้ไกด์ได้ที่นี่
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Guide Info */}
                  {booking.trip_offer?.guide && (
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl font-semibold">
                        {booking.trip_offer.guide.user?.first_name?.[0]}
                        {booking.trip_offer.guide.user?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {booking.trip_offer.guide.user?.first_name}{" "}
                          {booking.trip_offer.guide.user?.last_name}
                        </p>
                        {booking.trip_offer.guide.average_rating > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-yellow-400">⭐</span>
                            <span className="font-medium">
                              {booking.trip_offer.guide.average_rating.toFixed(
                                1
                              )}
                            </span>
                            <span className="text-gray-500">
                              ({booking.trip_offer.guide.total_reviews || 0})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Trip Info */}
                  <div className="space-y-3 mb-4">
                    {booking.trip_offer?.trip_require && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 text-xl">📍</span>
                        <div>
                          <p className="text-sm text-gray-600">ปลายทาง</p>
                          <p className="font-medium text-gray-900">
                            {booking.trip_offer.trip_require.destination}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 text-xl">📅</span>
                      <div>
                        <p className="text-sm text-gray-600">วันที่เดินทาง</p>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.trip_date).toLocaleDateString(
                            "th-TH",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => router.push(`/reviews/create/${booking.id}`)}
                    className="w-full bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>⭐</span>
                    เขียนรีวิว
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
