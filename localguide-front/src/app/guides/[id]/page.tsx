"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import ReviewList from "@/app/components/reviews/ReviewList";

export default function GuideDetailPage() {
  const params = useParams();
  const guideId = params.id as string;
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuideDetails();
  }, [guideId]);

  const fetchGuideDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/guides/${guideId}`
      );
      if (response.ok) {
        const data = await response.json();
        setGuide(data.guide);
      }
    } catch (error) {
      console.error("Error fetching guide:", error);
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

  if (!guide) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">ไม่พบข้อมูลไกด์</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Guide Profile Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-4xl font-semibold">
                  {guide.User?.FirstName?.[0]}
                  {guide.User?.LastName?.[0]}
                </div>
              </div>

              {/* Guide Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {guide.User?.FirstName} {guide.User?.LastName}
                    </h1>
                    {guide.IsVerified && (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <span>✅</span>
                        <span className="font-medium">
                          ไกด์ที่ได้รับการยืนยัน
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  {guide.Rating > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                      <span className="text-2xl">⭐</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {guide.Rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({guide.TotalReviews || 0} รีวิว)
                      </span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {guide.Bio && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {guide.Bio}
                  </p>
                )}

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {guide.Province && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">📍</span>
                      <div>
                        <p className="text-sm text-gray-600">จังหวัด</p>
                        <p className="font-medium text-gray-900">
                          {guide.Province.Name}
                        </p>
                      </div>
                    </div>
                  )}

                  {guide.YearsOfExperience && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-sm text-gray-600">ประสบการณ์</p>
                        <p className="font-medium text-gray-900">
                          {guide.YearsOfExperience} ปี
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Languages */}
                {guide.Language && guide.Language.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">ภาษาที่พูดได้</p>
                    <div className="flex flex-wrap gap-2">
                      {guide.Language.map((lang: any) => (
                        <span
                          key={lang.ID}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                        >
                          {lang.Name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specializations */}
                {guide.Specializations && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">ความเชี่ยวชาญ</p>
                    <p className="text-gray-700">{guide.Specializations}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              รีวิวจากลูกค้า
            </h2>
            <ReviewList guideId={parseInt(guideId)} />
          </div>
        </div>
      </div>
    </>
  );
}
