"use client";

import { useState } from "react";

interface ReviewFormProps {
  bookingId: number;
  onSubmit: (reviewData: any) => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  bookingId,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [knowledgeRating, setKnowledgeRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const renderStarRating = (
    value: number,
    onChange: (value: number) => void,
    label: string,
    hoverValue?: number | null
  ) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                className="focus:outline-none transition-transform hover:scale-110 text-3xl"
              >
                <span
                  className={`${
                    star <= (hoverValue || value)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ⭐
                </span>
              </button>
            ))}
          </div>
          <span className="text-lg font-semibold text-gray-700 min-w-[3rem]">
            {hoverValue || value} / 5
          </span>
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reviewData = {
      trip_booking_id: bookingId,
      rating,
      comment,
      service_rating: serviceRating,
      knowledge_rating: knowledgeRating,
      communication_rating: communicationRating,
      punctuality_rating: punctualityRating,
      is_anonymous: isAnonymous,
    };

    onSubmit(reviewData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6"
    >
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">เขียนรีวิวให้ไกด์</h2>
        <p className="text-gray-600 mt-1">
          แบ่งปันประสบการณ์การท่องเที่ยวของคุณ
        </p>
      </div>

      {/* Overall Rating */}
      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border border-emerald-100">
        {renderStarRating(rating, setRating, "คะแนนโดยรวม", hoveredRating)}
      </div>

      {/* Detailed Ratings */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          {renderStarRating(serviceRating, setServiceRating, "การบริการ")}
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          {renderStarRating(
            knowledgeRating,
            setKnowledgeRating,
            "ความรู้ความเชี่ยวชาญ"
          )}
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          {renderStarRating(
            communicationRating,
            setCommunicationRating,
            "การสื่อสาร"
          )}
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          {renderStarRating(
            punctualityRating,
            setPunctualityRating,
            "ความตรงต่อเวลา"
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          รีวิวของคุณ <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          placeholder="บอกเล่าประสบการณ์ของคุณกับไกด์คนนี้..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          rows={5}
        />
        <p className="text-sm text-gray-500">ขั้นต่ำ 10 ตัวอักษร</p>
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="anonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="w-5 h-5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
        />
        <label htmlFor="anonymous" className="text-sm text-gray-700">
          เขียนรีวิวแบบไม่ระบุตัวตน
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={comment.length < 10}
          className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          ส่งรีวิว
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}
