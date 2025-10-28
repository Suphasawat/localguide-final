"use client";

interface ReviewStatsProps {
  stats: any; // Allow flexible stats format from backend
}

export default function ReviewStats({ stats }: ReviewStatsProps) {
  // Normalize the stats object to handle different formats
  const normalizedStats = {
    total_reviews: stats.TotalReviews || stats.total_reviews || 0,
    average_rating: stats.AverageRating || stats.average_rating || 0,
    average_service: stats.AverageService || stats.average_service || 0,
    average_knowledge: stats.AverageKnowledge || stats.average_knowledge || 0,
    average_communication:
      stats.AverageCommunication || stats.average_communication || 0,
    average_punctuality:
      stats.AveragePunctuality || stats.average_punctuality || 0,
    five_stars: stats.FiveStars || stats.five_stars || 0,
    four_stars: stats.FourStars || stats.four_stars || 0,
    three_stars: stats.ThreeStars || stats.three_stars || 0,
    two_stars: stats.TwoStars || stats.two_stars || 0,
    one_star: stats.OneStar || stats.one_star || 0,
  };

  // Don't render if no reviews
  if (normalizedStats.total_reviews === 0) {
    return null;
  }
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const renderRatingBar = (stars: number, count: number) => {
    const percentage =
      normalizedStats.total_reviews > 0
        ? (count / normalizedStats.total_reviews) * 100
        : 0;

    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 min-w-[3rem]">{stars} ดาว</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 min-w-[3rem] text-right">
          {count}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">สถิติรีวิว</h3>

      {/* Overall Rating */}
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {normalizedStats.average_rating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            {renderStars(Math.round(normalizedStats.average_rating))}
          </div>
          <p className="text-sm text-gray-600">
            {normalizedStats.total_reviews} รีวิว
          </p>
        </div>

        <div className="flex-1 space-y-2">
          {renderRatingBar(5, normalizedStats.five_stars)}
          {renderRatingBar(4, normalizedStats.four_stars)}
          {renderRatingBar(3, normalizedStats.three_stars)}
          {renderRatingBar(2, normalizedStats.two_stars)}
          {renderRatingBar(1, normalizedStats.one_star)}
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-emerald-500">📈</span>
          คะแนนรายละเอียด
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">บริการ</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-base ${
                      star <= Math.round(normalizedStats.average_service)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {normalizedStats.average_service.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">ความรู้</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-base ${
                      star <= Math.round(normalizedStats.average_knowledge)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {normalizedStats.average_knowledge.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">การสื่อสาร</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-base ${
                      star <= Math.round(normalizedStats.average_communication)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {normalizedStats.average_communication.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">ความตรงเวลา</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-base ${
                      star <= Math.round(normalizedStats.average_punctuality)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {normalizedStats.average_punctuality.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
