"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaUsers,
  FaStar,
  FaClock,
  FaEye,
} from "react-icons/fa";
import { MdDescription } from "react-icons/md";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { getUser } from "../services/auth.service";
import { tripService, TripRequire } from "../services/trip.service";

dayjs.locale("th");

export default function TripRequiresPage() {
  const [tripRequires, setTripRequires] = useState<TripRequire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadTripRequires();
  }, []);

  const loadTripRequires = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripRequires();
      setTripRequires(data);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in_review":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "เปิดรับข้อเสนอ";
      case "in_review":
        return "กำลังพิจารณา";
      case "assigned":
        return "เลือกไกด์แล้ว";
      case "completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadTripRequires}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">หาไกด์ท้องถิ่น</h1>
            <p className="mt-2 text-gray-600">
              โพสต์ความต้องการของคุณและรับข้อเสนอจากไกด์มืออาชีพ
            </p>
          </div>
          <button
            onClick={() => router.push("/trip-requires/create")}
            className="flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold"
          >
            <FaPlus className="mr-2" />
            โพสต์ต้องการไกด์
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaEye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  โพสต์ทั้งหมด
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tripRequires.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaClock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  เปิดรับข้อเสนอ
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tripRequires.filter((tr) => tr.Status === "open").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  กำลังดำเนินการ
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {
                    tripRequires.filter((tr) =>
                      ["in_review", "assigned"].includes(tr.Status)
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Requires List */}
        {tripRequires.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaMapMarkerAlt className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ยังไม่มีโพสต์ต้องการไกด์
            </h3>
            <p className="text-gray-500 mb-6">
              เป็นคนแรกที่โพสต์ความต้องการหาไกด์ท้องถิ่น
            </p>
            <button
              onClick={() => router.push("/trip-requires/create")}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold"
            >
              โพสต์ต้องการไกด์
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {tripRequires.map((tripRequire) => (
              <div
                key={tripRequire.ID}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/trip-requires/${tripRequire.ID}`)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {tripRequire.Title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2">
                        {tripRequire.Description}
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        tripRequire.Status
                      )}`}
                    >
                      {getStatusText(tripRequire.Status)}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* จังหวัด */}
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">จังหวัด</p>
                        <p className="font-medium text-gray-900">
                          {tripRequire.Province.Name}
                        </p>
                      </div>
                    </div>

                    {/* วันที่ */}
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">ช่วงวันที่</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {dayjs(tripRequire.StartDate).format("DD/MM")} -{" "}
                          {dayjs(tripRequire.EndDate).format("DD/MM")}
                          <span className="text-xs text-gray-500 block">
                            ({tripRequire.Days} วัน)
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* งบประมาณ */}
                    <div className="flex items-center space-x-2">
                      <FaDollarSign className="text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">งบประมาณ</p>
                        <p className="font-medium text-gray-900 text-sm">
                          ฿{tripRequire.MinPrice.toLocaleString()} - ฿
                          {tripRequire.MaxPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* จำนวนคน */}
                    <div className="flex items-center space-x-2">
                      <FaUsers className="text-purple-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">จำนวนคน</p>
                        <p className="font-medium text-gray-900">
                          {tripRequire.GroupSize} คน
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating Requirement */}
                  {tripRequire.MinRating > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                      <FaStar className="text-yellow-500" />
                      <span className="text-sm text-gray-600">
                        ต้องการไกด์ที่มีเรตติ้งอย่างน้อย {tripRequire.MinRating}{" "}
                        ดาว
                      </span>
                    </div>
                  )}

                  {/* Requirements */}
                  {tripRequire.Requirements && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MdDescription className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          ความต้องการเพิ่มเติม
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {tripRequire.Requirements}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        โพสต์เมื่อ{" "}
                        {dayjs(tripRequire.PostedAt).format("DD/MM/YYYY")}
                      </span>
                      {tripRequire.TripOffers &&
                        tripRequire.TripOffers.length > 0 && (
                          <span className="flex items-center">
                            <FaUsers className="mr-1" />
                            {tripRequire.TripOffers.length} ข้อเสนอ
                          </span>
                        )}
                    </div>

                    {tripRequire.ExpiresAt && (
                      <span className="text-sm text-red-500">
                        หมดอายุ{" "}
                        {dayjs(tripRequire.ExpiresAt).format("DD/MM/YYYY")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Posts Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/my-trip-requires")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
          >
            ดูโพสต์ของฉัน
          </button>
        </div>
      </div>
    </div>
  );
}
