"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaCertificate,
  FaLanguage,
  FaMapPin,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdAttachMoney, MdLocationOn } from "react-icons/md";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { getUser } from "../../services/auth.service";
import { bookingService, Review, UnavailableDate } from "../../services/booking.service";

dayjs.locale("th");

interface Guide {
  ID: number;
  User: {
    ID: number;
    FirstName: string;
    LastName: string;
    Nickname: string;
    Avatar: string;
  };
  Bio: string;
  Description: string;
  Price: number;
  Rating: number;
  District: string;
  City: string;
  Province: string;
  Language: { ID: number; Name: string }[];
  TouristAttraction: { ID: number; Name: string }[];
  Certification: { ID: number; ImagePath: string; Description: string }[];
  Available: boolean;
}

export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]); // เปลี่ยนเป็น string[] ตามที่ service ส่งมา
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    note: "",
  });
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const user = getUser();
  const guideId = params.id as string;

  useEffect(() => {
    loadGuideDetail();
  }, [guideId]);

  const loadGuideDetail = async () => {
    try {
      setLoading(true);

      // เรียก API ดึงข้อมูลไกด์
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/guides/${guideId}`
      );
      if (!response.ok) {
        throw new Error("Guide not found");
      }
      const data = await response.json();
      setGuide(data.guide);

      // ดึงข้อมูล reviews และ unavailable dates พร้อมกัน
      const [reviewsData, unavailableDatesData] = await Promise.allSettled([
        bookingService.getGuideReviews(parseInt(guideId)),
        bookingService.getUnavailableDates(parseInt(guideId)),
      ]);

      if (reviewsData.status === "fulfilled") {
        setReviews(reviewsData.value);
      }

      if (unavailableDatesData.status === "fulfilled") {
        setUnavailableDates(unavailableDatesData.value);
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // แก้ไขฟังก์ชัน isDateUnavailable ให้ใช้กับ string array
  const isDateUnavailable = (date: string) => {
    return unavailableDates.includes(date);
  };

  const generateCalendar = () => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const startDate = startOfMonth.startOf("week");
    const endDate = endOfMonth.endOf("week");

    const days = [];
    let current = startDate;

    while (current.isBefore(endDate) || current.isSame(endDate)) {
      days.push(current);
      current = current.add(1, "day");
    }

    return days;
  };

  // คำนวณวันและราคา
  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate && guide) {
      const start = dayjs(bookingData.startDate);
      const end = dayjs(bookingData.endDate);

      if (end.isAfter(start) || end.isSame(start)) {
        const days = end.diff(start, "day") + 1;
        setTotalDays(days);
        setTotalPrice(days * guide.Price);
      } else {
        setTotalDays(0);
        setTotalPrice(0);
      }
    }
  }, [bookingData.startDate, bookingData.endDate, guide]);

  // ตรวจสอบว่าช่วงวันที่เลือกมีวันที่ไม่ว่างหรือไม่
  const hasUnavailableDatesInRange = () => {
    if (!bookingData.startDate || !bookingData.endDate) return false;

    const start = dayjs(bookingData.startDate);
    const end = dayjs(bookingData.endDate);

    let current = start;
    while (current.isBefore(end) || current.isSame(end)) {
      if (isDateUnavailable(current.format("YYYY-MM-DD"))) {
        return true;
      }
      current = current.add(1, "day");
    }
    return false;
  };

  const isDatePast = (date: dayjs.Dayjs) => {
    return date.isBefore(dayjs(), "day");
  };

  const handleDateSelect = (date: dayjs.Dayjs) => {
    if (isDatePast(date) || isDateUnavailable(date.format("YYYY-MM-DD"))) return;
    setSelectedDate(date.format("YYYY-MM-DD"));
  };

  const handleBooking = async () => {
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนจอง");
      return;
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      alert("กรุณาเลือกวันที่");
      return;
    }

    if (hasUnavailableDatesInRange()) {
      alert("ช่วงวันที่เลือกมีวันที่ไม่ว่าง กรุณาเลือกช่วงวันใหม่");
      return;
    }

    setBookingLoading(true);
    try {
      await bookingService.createBooking({
        guideID: guide!.ID,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        note: bookingData.note,
      });

      alert(`จองสำเร็จ! จำนวน ${totalDays} วัน ราคารวม ฿${totalPrice.toLocaleString()}`);
      setShowBookingModal(false);
      setBookingData({ startDate: "", endDate: "", note: "" });
      setTotalDays(0);
      setTotalPrice(0);
    } catch (error: any) {
      alert(error.message || "เกิดข้อผิดพลาดในการจอง");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || "ไม่พบข้อมูลไกด์"}</p>
          <button
            onClick={() => router.push("/guides")}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            กลับไปหาไกด์
          </button>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendar();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaChevronLeft className="mr-2" />
            กลับ
          </button>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* รูปโปรไฟล์ */}
              <div className="md:w-1/3 p-8 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-4xl font-bold text-amber-600 mb-4">
                    {guide.User.FirstName.charAt(0)}
                    {guide.User.LastName.charAt(0)}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {guide.User.FirstName} {guide.User.LastName}
                  </h1>
                  {guide.User.Nickname && (
                    <p className="text-gray-600 mb-2">
                      ({guide.User.Nickname})
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(guide.Rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600">
                        ({guide.Rating?.toFixed(1) || "0.0"})
                      </span>
                    </div>
                  </div>

                  {/* ราคา */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-center text-2xl font-bold text-amber-600">
                      <MdAttachMoney className="mr-1" />
                      {guide.Price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        /วัน
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ข้อมูลรายละเอียด */}
              <div className="md:w-2/3 p-8">
                {/* ที่อยู่ */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <MdLocationOn className="text-red-500 mr-2" />
                    <h3 className="text-lg font-semibold">พื้นที่ให้บริการ</h3>
                  </div>
                  <p className="text-gray-700">
                    {guide.District && `${guide.District}, `}
                    {guide.City}, {guide.Province}
                  </p>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FaUser className="text-blue-500 mr-2" />
                    <h3 className="text-lg font-semibold">เกี่ยวกับไกด์</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{guide.Bio}</p>
                </div>

                {/* Description/Experience */}
                {guide.Description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">ประสบการณ์</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {guide.Description}
                    </p>
                  </div>
                )}

                {/* ภาษา */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FaLanguage className="text-green-500 mr-2" />
                    <h3 className="text-lg font-semibold">ภาษาที่ใช้ได้</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {guide.Language.map((lang) => (
                      <span
                        key={lang.ID}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {lang.Name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* สถานที่ท่องเที่ยว */}
                {guide.TouristAttraction.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <FaMapPin className="text-purple-500 mr-2" />
                      <h3 className="text-lg font-semibold">
                        สถานที่ท่องเที่ยวแนะนำ
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {guide.TouristAttraction.map((attraction) => (
                        <span
                          key={attraction.ID}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {attraction.Name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ใบรับรอง */}
        {guide.Certification?.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <FaCertificate className="text-yellow-500 mr-2" />
                <h2 className="text-xl font-bold">ใบรับรอง</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guide.Certification.map((cert) => (
                  <div key={cert.ID} className="bg-gray-50 rounded-lg p-4">
                    {cert.ImagePath && (
                      <img
                        src={cert.ImagePath}
                        alt={cert.Description}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <p className="text-sm text-gray-700">{cert.Description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ปฏิทิน */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FaCalendarAlt className="text-indigo-500 mr-2" />
                <h2 className="text-xl font-bold">เลือกวันที่จอง</h2>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    setCurrentMonth(currentMonth.subtract(1, "month"))
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-lg font-semibold min-w-[150px] text-center">
                  {currentMonth.format("MMMM YYYY")}
                </span>
                <button
                  onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center font-semibold text-gray-500 text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.month() === currentMonth.month();
                const isPast = isDatePast(date);
                const isUnavailable = isDateUnavailable(date.format("YYYY-MM-DD")); // แก้ไขตรงนี้
                const isSelected = selectedDate === date.format("YYYY-MM-DD");

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={isPast || isUnavailable}
                    className={`
                      p-3 text-center text-sm rounded-lg transition-colors
                      ${!isCurrentMonth ? "text-gray-300" : "text-gray-900"}
                      ${
                        isPast || isUnavailable
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "hover:bg-gray-100"
                      }
                      ${isSelected ? "bg-amber-500 text-white hover:bg-amber-600" : ""}
                    `}
                  >
                    {date.date()}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                  <span>ไม่ว่าง</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
                  <span>เลือกแล้ว</span>
                </div>
              </div>

              {selectedDate && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold"
                >
                  จองวันที่ {dayjs(selectedDate).format("DD MMMM YYYY")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6">รีวิวจากนักท่องเที่ยว</h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">ยังไม่มีรีวิว</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.ID}
                  className="border-b border-gray-100 pb-6 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.User.FirstName} {review.User.LastName}
                      </h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.Rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {dayjs(review.CreatedAt).format("DD MMMM YYYY")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.Comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && guide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  จองไกด์ท้องถิ่น
                </h2>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingData({ startDate: "", endDate: "", note: "" });
                    setTotalDays(0);
                    setTotalPrice(0);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <img
                    src={guide.User.Avatar || "/default-avatar.jpg"}
                    alt={`${guide.User.FirstName} ${guide.User.LastName}`}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {guide.User.FirstName} {guide.User.LastName}
                    </h3>
                    <p className="text-gray-600">
                      {guide.City}, {guide.Province}
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      ฿{guide.Price.toLocaleString()} / วัน
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* เลือกวันที่เริ่มต้น */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    วันที่เริ่มต้น
                  </label>
                  <input
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    min={dayjs().format("YYYY-MM-DD")}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-200"
                  />
                </div>

                {/* เลือกวันที่สิ้นสุด */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    วันที่สิ้นสุด
                  </label>
                  <input
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    min={bookingData.startDate || dayjs().format("YYYY-MM-DD")}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-200"
                  />
                </div>

                {/* แสดงสรุปการจอง */}
                {totalDays > 0 && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                      สรุปการจอง
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">จำนวนวัน:</span>
                        <span className="font-semibold">{totalDays} วัน</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ราคาต่อวัน:</span>
                        <span className="font-semibold">
                          ฿{guide.Price.toLocaleString()}
                        </span>
                      </div>
                      <hr className="border-amber-200" />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">ราคารวม:</span>
                        <span className="font-bold text-amber-600">
                          ฿{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* แจ้งเตือนถ้ามีวันไม่ว่างในช่วงที่เลือก */}
                {hasUnavailableDatesInRange() && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="text-red-500 mr-2" />
                      <span className="text-red-700 font-semibold">
                        ช่วงวันที่เลือกมีวันที่ไม่ว่าง กรุณาเลือกช่วงวันใหม่
                      </span>
                    </div>
                  </div>
                )}

                {/* หมายเหตุ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    หมายเหตุ (ไม่บังคับ)
                  </label>
                  <textarea
                    value={bookingData.note}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-200 resize-none"
                    placeholder="ข้อมูลเพิ่มเติมสำหรับไกด์..."
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingData({ startDate: "", endDate: "", note: "" });
                    setTotalDays(0);
                    setTotalPrice(0);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleBooking}
                  disabled={
                    bookingLoading ||
                    !bookingData.startDate ||
                    !bookingData.endDate ||
                    totalDays <= 0 ||
                    hasUnavailableDatesInRange()
                  }
                  className="flex-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {bookingLoading
                    ? "กำลังจอง..."
                    : `จองเลย - ฿${totalPrice.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
