"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { tripOfferAPI } from "../../../lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface TripOffer {
  ID: number;
  Title: string;
  Description: string;
  Status: string;
  SentAt: string;
  Itinerary?: string;
  IncludedServices?: string;
  ExcludedServices?: string;
  OfferNotes?: string;
  TripRequire: {
    ID: number;
    Title: string;
    Description: string;
    MinPrice: number;
    MaxPrice: number;
    StartDate: string;
    EndDate: string;
    Days: number;
    GroupSize: number;
    Province?: { Name: string };
    User: {
      FirstName: string;
      LastName: string;
      Email: string;
    };
  };
  TripOfferQuotation: Array<{
    ID: number;
    TotalPrice: number;
    ValidUntil: string;
    PriceBreakdown?: string;
    Terms?: string;
    PaymentTerms?: string;
    CreatedAt: string;
  }>;
}

export default function TripOfferDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const offerId = params.id as string;

  const [offer, setOffer] = useState<TripOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== 2) {
      router.push("/dashboard");
      return;
    }

    loadOfferDetail();
  }, [user, isAuthenticated, offerId, router]);

  const loadOfferDetail = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await tripOfferAPI.getById(Number(offerId));
      const data = response.data?.data || response.data?.offer || response.data;
      setOffer(data);
    } catch (error: any) {
      console.error("Failed to load offer:", error);
      setError(
        error.response?.data?.error ||
          "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-600";
      case "withdrawn":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "ฉบับร่าง";
      case "sent":
        return "ส่งแล้ว";
      case "accepted":
        return "ได้รับการยอมรับ";
      case "rejected":
        return "ถูกปฏิเสธ";
      case "expired":
        return "หมดอายุ";
      case "withdrawn":
        return "ถอนคืน";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-lg">กำลังโหลด...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !offer) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || "ไม่พบข้อมูลข้อเสนอ"}
            </div>
            <button
              onClick={() => router.push("/guide/my-offers")}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              ← กลับไปรายการข้อเสนอ
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const latestQuotation = offer.TripOfferQuotation?.[0];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/guide/my-offers")}
              className="mb-4 text-blue-600 hover:text-blue-800"
            >
              ← กลับไปรายการข้อเสนอ
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {offer.Title}
                </h1>
                <p className="mt-2 text-gray-600">
                  ส่งเมื่อ:{" "}
                  {new Date(offer.SentAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`px-4 py-2 text-sm rounded-full ${getStatusColor(
                  offer.Status
                )}`}
              >
                {getStatusText(offer.Status)}
              </span>
            </div>
          </div>

          {/* Trip Requirement Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">ความต้องการของลูกค้า</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">ชื่อทริป:</span>{" "}
                <span className="font-medium">{offer.TripRequire.Title}</span>
              </div>
              <div>
                <span className="text-gray-600">ลูกค้า:</span>{" "}
                <span className="font-medium">
                  {offer.TripRequire.User.FirstName}{" "}
                  {offer.TripRequire.User.LastName}
                </span>
              </div>
              <div>
                <span className="text-gray-600">อีเมล:</span>{" "}
                <span className="font-medium">
                  {offer.TripRequire.User.Email}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div>📍 จังหวัด: {offer.TripRequire.Province?.Name || "-"}</div>
                <div>👥 จำนวนคน: {offer.TripRequire.GroupSize} คน</div>
                <div>📅 ระยะเวลา: {offer.TripRequire.Days} วัน</div>
                <div>
                  💰 งบประมาณ: {offer.TripRequire.MinPrice.toLocaleString()} -{" "}
                  {offer.TripRequire.MaxPrice.toLocaleString()} บาท
                </div>
                <div>
                  🧭 เริ่ม:{" "}
                  {new Date(offer.TripRequire.StartDate).toLocaleDateString(
                    "th-TH"
                  )}
                </div>
                <div>
                  🏁 สิ้นสุด:{" "}
                  {new Date(offer.TripRequire.EndDate).toLocaleDateString(
                    "th-TH"
                  )}
                </div>
              </div>
              <div className="pt-2">
                <span className="text-gray-600">รายละเอียด:</span>
                <p className="mt-1 text-gray-700">
                  {offer.TripRequire.Description}
                </p>
              </div>
            </div>
          </div>

          {/* Offer Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">รายละเอียดข้อเสนอ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  รายละเอียดแพ็กเกจ
                </h3>
                <p className="text-gray-600">{offer.Description}</p>
              </div>

              {offer.Itinerary && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    กำหนดการเที่ยว
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {offer.Itinerary}
                    </pre>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {offer.IncludedServices && (
                  <div>
                    <h3 className="font-medium text-green-700 mb-2">
                      ✅ บริการที่รวมอยู่
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap font-sans text-gray-700">
                        {offer.IncludedServices}
                      </pre>
                    </div>
                  </div>
                )}
                {offer.ExcludedServices && (
                  <div>
                    <h3 className="font-medium text-red-700 mb-2">
                      ❌ บริการที่ไม่รวม
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap font-sans text-gray-700">
                        {offer.ExcludedServices}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {offer.OfferNotes && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    หมายเหตุเพิ่มเติม
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {offer.OfferNotes}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quotation */}
          {latestQuotation && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">💰 ใบเสนอราคา</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-lg font-medium">ราคารวม:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ฿{latestQuotation.TotalPrice.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-gray-600">มีผลถึง:</span>{" "}
                  <span className="font-medium">
                    {new Date(latestQuotation.ValidUntil).toLocaleDateString(
                      "th-TH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>

                {latestQuotation.PriceBreakdown && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      📊 รายละเอียดค่าใช้จ่าย
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap font-sans text-gray-700">
                        {latestQuotation.PriceBreakdown}
                      </pre>
                    </div>
                  </div>
                )}

                {latestQuotation.Terms && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      📋 เงื่อนไขการให้บริการ
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap font-sans text-gray-700">
                        {latestQuotation.Terms}
                      </pre>
                    </div>
                  </div>
                )}

                {latestQuotation.PaymentTerms && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      💳 เงื่อนไขการชำระเงิน
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap font-sans text-gray-700">
                        {latestQuotation.PaymentTerms}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {offer.Status === "accepted" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <p className="font-semibold">ข้อเสนอนี้ได้รับการยอมรับแล้ว</p>
                  <p className="text-sm mt-1">
                    ลูกค้าได้ยอมรับข้อเสนอของคุณแล้ว
                    คุณสามารถดูรายละเอียดการจองได้ที่หน้า "การจองทริป"
                  </p>
                </div>
              </div>
            </div>
          )}

          {offer.Status === "rejected" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">❌</span>
                <div>
                  <p className="font-semibold">ข้อเสนอนี้ถูกปฏิเสธ</p>
                  <p className="text-sm mt-1">ลูกค้าได้ปฏิเสธข้อเสนอนี้แล้ว</p>
                </div>
              </div>
            </div>
          )}

          {offer.Status === "expired" && (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⏰</span>
                <div>
                  <p className="font-semibold">ข้อเสนอนี้หมดอายุแล้ว</p>
                  <p className="text-sm mt-1">
                    ข้อเสนอนี้หมดอายุแล้วเนื่องจากเกินระยะเวลาที่กำหนด
                  </p>
                </div>
              </div>
            </div>
          )}

          {offer.Status === "sent" && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⏳</span>
                <div>
                  <p className="font-semibold">รอลูกค้าตอบรับ</p>
                  <p className="text-sm mt-1">
                    ข้อเสนอนี้ส่งไปยังลูกค้าแล้ว กำลังรอการตอบรับ
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/guide/my-offers")}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              กลับไปรายการข้อเสนอ
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
