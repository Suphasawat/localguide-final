"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ReviewCard from "./ReviewCard";
import ReviewStats from "./ReviewStats";

interface Review {
  id: number;
  rating: number;
  comment: string;
  service_rating: number;
  knowledge_rating: number;
  communication_rating: number;
  punctuality_rating: number;
  is_anonymous: boolean;
  helpful_count: number;
  guide_response?: string;
  guide_response_at?: string;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    profile_image?: string;
  };
}

interface ReviewListProps {
  guideId: number;
  isGuide?: boolean;
  currentUserId?: number;
}

export default function ReviewList({
  guideId,
  isGuide = false,
  currentUserId,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/guides/${guideId}/reviews`
      );

      if (!response.ok) {
        console.error("API response not OK:", response.status);
        setReviews([]);
        setStats(null);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.reviews && Array.isArray(data.reviews)) {
        // Transform the reviews to match frontend interface
        const transformedReviews = data.reviews
          .filter((review: any) => {
            const isValid =
              review && review.ID && typeof review.Rating === "number";
            if (!isValid) {
              console.warn("Invalid review filtered out:", review);
            }
            return isValid;
          })
          .map((review: any) => ({
            id: review.ID,
            rating: review.Rating,
            comment: review.Comment || "",
            service_rating: review.ServiceRating || review.Rating,
            knowledge_rating: review.KnowledgeRating || review.Rating,
            communication_rating: review.CommunicationRating || review.Rating,
            punctuality_rating: review.PunctualityRating || review.Rating,
            is_anonymous: review.IsAnonymous || false,
            helpful_count: review.HelpfulCount || 0,
            guide_response: review.ResponseFromGuide || "",
            guide_response_at: review.RespondedAt || "",
            created_at: review.CreatedAt || new Date().toISOString(),
            user: review.User
              ? {
                  id: review.User.ID || 0,
                  first_name: review.User.FirstName || "ผู้ใช้",
                  last_name: review.User.LastName || "",
                  profile_image: review.User.Avatar || "",
                }
              : {
                  id: 0,
                  first_name: "ผู้ใช้",
                  last_name: "",
                  profile_image: "",
                },
          }));

        setReviews(transformedReviews);
        setStats(data.stats);
      } else {
        setReviews([]);
        setStats(null);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:8080/api/reviews/${reviewId}/helpful`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Refresh reviews
        fetchReviews();
      }
    } catch (error) {
      console.error("Error marking review as helpful:", error);
    }
  };

  const handleRespond = async (reviewId: number, responseText: string) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:8080/api/reviews/${reviewId}/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ response: responseText }),
        }
      );

      if (response.ok) {
        alert("ตอบกลับรีวิวเรียบร้อยแล้ว");
        // Refresh reviews
        fetchReviews();
      } else {
        alert("เกิดข้อผิดพลาดในการตอบกลับรีวิว");
      }
    } catch (error) {
      console.error("Error responding to review:", error);
      alert("เกิดข้อผิดพลาดในการตอบกลับรีวิว");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.length > 0 && stats && <ReviewStats stats={stats} />}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">
          รีวิวทั้งหมด ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <p className="text-gray-600 text-lg">ยังไม่มีรีวิว</p>
            <p className="text-gray-500 text-sm mt-2">
              เป็นคนแรกที่ให้รีวิวไกด์คนนี้
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter((review) => review && review.id) // Filter out invalid reviews
              .map((review, index) => (
                <ReviewCard
                  key={`review-${review.id}-${index}`}
                  review={review}
                  onMarkHelpful={handleMarkHelpful}
                  onRespond={isGuide ? handleRespond : undefined}
                  isGuide={isGuide}
                  currentUserId={currentUserId}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
