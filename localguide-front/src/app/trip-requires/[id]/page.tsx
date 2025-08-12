"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUser,
} from "react-icons/fa";
import { MdDescription, MdAttachMoney } from "react-icons/md";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { getUser } from "../../services/auth.service";
import {
  tripService,
  TripRequire,
  TripOffer,
} from "../../services/trip.service";

dayjs.locale("th");

export default function TripRequireDetailPage() {
  const [tripRequire, setTripRequire] = useState<TripRequire | null>(null);
  const [offers, setOffers] = useState<TripOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingOfferId, setAcceptingOfferId] = useState<number | null>(null);

  const router = useRouter();
  const params = useParams();
  const user = getUser();
  const id = parseInt(params.id as string);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadTripRequireDetail();
  }, [id]);

  const loadTripRequireDetail = async () => {
    try {
      setLoading(true);
      const tripRequireData = await tripService.getTripRequire(id);
      const offersData = await tripService.getTripOffers(id);

      setTripRequire(tripRequireData);
      setOffers(offersData);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ที่จะยอมรับข้อเสนอนี้? ข้อเสนออื่นๆ จะถูกปฏิเสธอัตโนมัติ"
      )
    ) {
      return;
    }

    setAcceptingOfferId(offerId);
    try {
      const result = await tripService.acceptTripOffer(offerId);
      alert("ยอมรับข้อเสนอสำเร็จ! คุณจะถูกนำไปหน้าชำระเงิน");

      // นำไปหน้าชำระเงิน
      router.push(`/trip-bookings/${result.trip_booking.ID}/payment`);
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการยอมรับข้อเสนอ");
    } finally {
      setAcceptingOfferId(null);
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    const reason = prompt("เหตุผลในการปฏิเสธ (ไม่บังคับ):");
    if (reason === null) return; // User cancelled

    try {
      await tripService.rejectTripOffer(offerId, reason || "");
      await loadTripRequireDetail(); // Refresh data
      alert("ปฏิเสธข้อเสนอเรียบร้อย");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการปฏิเสธข้อเสนอ");
    }
  };

  const getOfferStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOfferStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "รอตัดสิน";
      case "accepted":
        return "ยอมรับแล้ว";
      case "rejected":
        return "ปฏิเสธแล้ว";
      case "expired":
        return "หมดอายุ";
      default:
        return status;
    }
  };

  const parseJsonSafely = (jsonString: string, fallback: any = []) => {
    try {
      return JSON.parse(jsonString || "[]");
    } catch {
      return fallback;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !tripRequire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadTripRequireDetail}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === tripRequire.UserID;
  const canAcceptOffers = isOwner && tripRequire.Status === "open";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-amber-600 hover:text-amber-700 mb-4"
          >
            ← กลับ
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {tripRequire.Title}
          </h1>
          <p className="mt-2 text-gray-600">{tripRequire.Description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trip Require Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                รายละเอียดการเที่ยว
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">จังหวัด</p>
                    <p className="font-medium">{tripRequire.Province.Name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaCalendarAlt className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">ช่วงวันที่</p>
                    <p className="font-medium">
                      {dayjs(tripRequire.StartDate).format("DD/MM/YYYY")} -{" "}
                      {dayjs(tripRequire.EndDate).format("DD/MM/YYYY")}
                    </p>
                    <p className="text-sm text-gray-600">
                      ({tripRequire.Days} วัน)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaDollarSign className="text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">งบประมาณ</p>
                    <p className="font-medium">
                      ฿{tripRequire.MinPrice.toLocaleString()} - ฿
                      {tripRequire.MaxPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaUsers className="text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">จำนวนคน</p>
                    <p className="font-medium">{tripRequire.GroupSize} คน</p>
                  </div>
                </div>
              </div>

              {tripRequire.MinRating > 0 && (
                <div className="mt-6 flex items-center space-x-2">
                  <FaStar className="text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    ต้องการไกด์ที่มีเรตติ้งอย่างน้อย {tripRequire.MinRating} ดาว
                  </span>
                </div>
              )}

              {tripRequire.Requirements && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-2">
                    ความต้องการเพิ่มเติม
                  </h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {tripRequire.Requirements}
                  </p>
                </div>
              )}
            </div>

            {/* Offers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                ข้อเสนอจากไกด์ ({offers.length})
              </h2>

              {offers.length === 0 ? (
                <div className="text-center py-8">
                  <FaClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">ยังไม่มีข้อเสนอจากไกด์</p>
                  <p className="text-sm text-gray-400 mt-2">
                    รอสักครู่ ไกด์ท้องถิ่นจะมาเสนอราคาให้เร็วๆ นี้
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {offers.map((offer) => (
                    <div
                      key={offer.ID}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      {/* Guide Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {offer.Guide.User.FirstName}{" "}
                              {offer.Guide.User.LastName}
                            </h3>
                            {offer.Guide.User.Nickname && (
                              <p className="text-sm text-gray-500">
                                ({offer.Guide.User.Nickname})
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <FaStar className="text-yellow-400 text-sm" />
                              <span className="text-sm text-gray-600">
                                {offer.Guide.Rating.toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-600">
                                {offer.Guide.ProvinceRef.Name}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getOfferStatusColor(
                            offer.Status
                          )}`}
                        >
                          {getOfferStatusText(offer.Status)}
                        </span>
                      </div>

                      {/* Offer Details */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {offer.Title}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {offer.Description}
                        </p>

                        {/* Price */}
                        <div className="bg-green-50 p-4 rounded-lg mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-green-800">
                              ราคารวม: ฿{offer.TotalPrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-green-600">
                              (฿
                              {Math.round(
                                offer.TotalPrice / tripRequire.Days
                              ).toLocaleString()}
                              /วัน)
                            </span>
                          </div>
                        </div>

                        {/* Itinerary */}
                        {offer.Itinerary && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">
                              กำหนดการเที่ยว
                            </h5>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                {typeof offer.Itinerary === "string"
                                  ? offer.Itinerary
                                  : JSON.stringify(
                                      parseJsonSafely(offer.Itinerary),
                                      null,
                                      2
                                    )}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Services */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {offer.IncludedServices && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">
                                บริการที่รวม
                              </h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {parseJsonSafely(offer.IncludedServices).map(
                                  (service: string, index: number) => (
                                    <li
                                      key={index}
                                      className="flex items-center space-x-2"
                                    >
                                      <FaCheckCircle className="text-green-500 text-xs" />
                                      <span>{service}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                          {offer.ExcludedServices && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">
                                บริการที่ไม่รวม
                              </h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {parseJsonSafely(offer.ExcludedServices).map(
                                  (service: string, index: number) => (
                                    <li
                                      key={index}
                                      className="flex items-center space-x-2"
                                    >
                                      <FaTimesCircle className="text-red-500 text-xs" />
                                      <span>{service}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {offer.OfferNotes && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">
                              หมายเหตุ
                            </h5>
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                              {offer.OfferNotes}
                            </p>
                          </div>
                        )}

                        {/* Valid Until */}
                        <p className="text-sm text-gray-500">
                          ข้อเสนอนี้ใช้ได้ถึง{" "}
                          {dayjs(offer.OfferValidUntil).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      {canAcceptOffers && offer.Status === "pending" && (
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleRejectOffer(offer.ID)}
                            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                          >
                            ปฏิเสธ
                          </button>
                          <button
                            onClick={() => handleAcceptOffer(offer.ID)}
                            disabled={acceptingOfferId === offer.ID}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            {acceptingOfferId === offer.ID
                              ? "กำลังดำเนินการ..."
                              : "ยอมรับข้อเสนอ"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">สถานะ</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">สถานะปัจจุบัน</span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      tripRequire.Status === "open"
                        ? "bg-green-100 text-green-800"
                        : tripRequire.Status === "assigned"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tripRequire.Status === "open" && "เปิดรับข้อเสนอ"}
                    {tripRequire.Status === "assigned" && "เลือกไกด์แล้ว"}
                    {tripRequire.Status === "completed" && "เสร็จสิ้น"}
                    {tripRequire.Status === "cancelled" && "ยกเลิก"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">โพสต์เมื่อ</span>
                  <span className="text-gray-900">
                    {dayjs(tripRequire.PostedAt).format("DD/MM/YYYY")}
                  </span>
                </div>
                {tripRequire.ExpiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">หมดอายุ</span>
                    <span className="text-red-600">
                      {dayjs(tripRequire.ExpiresAt).format("DD/MM/YYYY")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">การจัดการ</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/my-trip-requires")}
                    className="w-full px-4 py-2 text-amber-600 border border-amber-600 rounded-lg hover:bg-amber-50"
                  >
                    ดูโพสต์ของฉัน
                  </button>

                  {tripRequire.SelectedOfferID && (
                    <button
                      onClick={() => router.push(`/trip-bookings`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      ดูการจอง
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
