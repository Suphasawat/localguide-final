"use client";

import { useState } from "react";

interface ReviewCardProps {
  review: {
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
  };
  onMarkHelpful?: (reviewId: number) => void;
  onRespond?: (reviewId: number, response: string) => void;
  isGuide?: boolean;
  currentUserId?: number;
}

export default function ReviewCard({
  review,
  onMarkHelpful,
  onRespond,
  isGuide = false,
  currentUserId,
}: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [response, setResponse] = useState("");

  // Safety check for review data
  if (!review || typeof review.rating !== "number") {
    return null;
  }

  const renderStars = (rating: number = 0, size: "sm" | "md" = "md") => {
    const sizeClass = size === "sm" ? "text-base" : "text-xl";
    const safeRating = rating || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${sizeClass} ${
              star <= safeRating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const handleSubmitResponse = () => {
    if (onRespond && response.trim()) {
      onRespond(review.id, response);
      setShowResponseForm(false);
      setResponse("");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {!review.is_anonymous && review.user?.first_name ? (
            <>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-lg">
                {review.user.first_name[0]}
                {review.user.last_name?.[0] || ""}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {review.user.first_name} {review.user.last_name || ""}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-xl">👤</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  ผู้ใช้งานไม่ระบุชื่อ
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {renderStars(review.rating)}
          <span className="text-lg font-semibold text-gray-900">
            {(review.rating || 0).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Comment */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {review.comment || "ไม่มีความคิดเห็น"}
      </p>

      {/* Detailed Ratings */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">บริการ</span>
          <div className="flex items-center gap-1">
            {renderStars(review.service_rating, "sm")}
            <span className="text-sm font-medium ml-1">
              {(review.service_rating || 0).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">ความรู้</span>
          <div className="flex items-center gap-1">
            {renderStars(review.knowledge_rating, "sm")}
            <span className="text-sm font-medium ml-1">
              {(review.knowledge_rating || 0).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">การสื่อสาร</span>
          <div className="flex items-center gap-1">
            {renderStars(review.communication_rating, "sm")}
            <span className="text-sm font-medium ml-1">
              {(review.communication_rating || 0).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">ความตรงต่อเวลา</span>
          <div className="flex items-center gap-1">
            {renderStars(review.punctuality_rating, "sm")}
            <span className="text-sm font-medium ml-1">
              {(review.punctuality_rating || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Guide Response */}
      {review.guide_response && (
        <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-600">💬</span>
            <span className="text-sm font-semibold text-emerald-900">
              คำตอบจากไกด์
            </span>
            <span className="text-xs text-gray-500">
              {new Date(review.guide_response_at!).toLocaleDateString("th-TH")}
            </span>
          </div>
          <p className="text-sm text-gray-700">{review.guide_response}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        {onMarkHelpful && (
          <button
            onClick={() => onMarkHelpful(review.id)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <span>👍</span>
            <span>เป็นประโยชน์ ({review.helpful_count || 0})</span>
          </button>
        )}

        {isGuide && !review.guide_response && (
          <button
            onClick={() => setShowResponseForm(!showResponseForm)}
            className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
          >
            <span>💬</span>
            <span>ตอบกลับรีวิว</span>
          </button>
        )}
      </div>

      {/* Response Form */}
      {showResponseForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="เขียนคำตอบของคุณ..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubmitResponse}
              disabled={!response.trim()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ส่งคำตอบ
            </button>
            <button
              onClick={() => {
                setShowResponseForm(false);
                setResponse("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
