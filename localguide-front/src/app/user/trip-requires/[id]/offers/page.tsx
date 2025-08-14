"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { tripOfferAPI, tripRequireAPI } from "../../../../lib/api";

interface TripOffer {
  ID: number;
  Title: string;
  Description: string;
  Status: string;
  OfferNotes?: string;
  SentAt?: string;
  Guide: {
    User: {
      FirstName: string;
      LastName: string;
    };
    Rating: number;
    Price: number;
  };
  TripOfferQuotation: Array<{
    TotalPrice: number;
    PriceBreakdown?: string;
    Terms?: string;
    PaymentTerms?: string;
    ValidUntil: string;
  }>;
}

interface TripRequire {
  ID: number;
  Title: string;
  Description: string;
  Status: string;
}

export default function TripOffersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const requireId = params.id as string;

  const [tripRequire, setTripRequire] = useState<TripRequire | null>(null);
  const [offers, setOffers] = useState<TripOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.Role?.Name !== "user") {
      router.push("/dashboard");
      return;
    }

    if (!requireId) {
      router.push("/user/trip-requires");
      return;
    }

    loadData();
  }, [user, isAuthenticated, requireId, router]);

  const loadData = async () => {
    try {
      const [requireResponse, offersResponse] = await Promise.all([
        tripRequireAPI.getById(Number(requireId)),
        tripOfferAPI.getByRequire(Number(requireId)),
      ]);

      setTripRequire(requireResponse.data);
      setOffers(offersResponse.data?.offers || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    if (
      !confirm(
        "คุณต้องการยอมรับข้อเสนอนี้หรือไม่? การยอมรับจะทำให้ข้อเสนออื่นๆ ถูกปฏิเสธอัตโนมัติ"
      )
    ) {
      return;
    }

    try {
      await tripOfferAPI.accept(offerId);
      router.push("/trip-bookings");
    } catch (error) {
      console.error("Failed to accept offer:", error);
      alert("ไม่สามารถยอมรับข้อเสนอได้");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "negotiating":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  if (!tripRequire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">ไม่พบข้อมูลความต้องการทริป</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            ← กลับ
          </button>
          <h1 className="text-3xl font-bold text-gray-900">ข้อเสนอที่ได้รับ</h1>
          <p className="mt-2 text-gray-600">สำหรับ: {tripRequire.Title}</p>
        </div>

        {/* Trip Require Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">ความต้องการของคุณ</h2>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{tripRequire.Title}</h3>
              <p className="text-gray-600 mt-2">{tripRequire.Description}</p>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                tripRequire.Status
              )}`}
            >
              {tripRequire.Status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {offers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              ยังไม่มีข้อเสนอสำหรับความต้องการนี้
            </p>
            <p className="text-gray-400 mt-2">โปรดรอไกด์ส่งข้อเสนอมาให้</p>
          </div>
        ) : (
          <div className="space-y-6">
            {offers.map((offer) => (
              <div
                key={offer.ID}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {offer.Title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        จาก: {offer.Guide?.User?.FirstName}{" "}
                        {offer.Guide?.User?.LastName}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                        offer.Status
                      )}`}
                    >
                      {offer.Status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700">{offer.Description}</p>
                  </div>

                  {/* Guide Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">ข้อมูลไกด์</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>⭐ คะแนน: {offer.Guide?.Rating || "ยังไม่มี"}/5</div>
                      <div>
                        💰 ราคาไกด์: {offer.Guide?.Price?.toLocaleString()}{" "}
                        บาท/วัน
                      </div>
                    </div>
                  </div>

                  {/* Quotation */}
                  {offer.TripOfferQuotation?.[0] && (
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-3">ใบเสนอราคา</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">ราคารวม:</span>
                          <span className="text-lg font-bold text-green-600">
                            {offer.TripOfferQuotation[0].TotalPrice?.toLocaleString()}{" "}
                            บาท
                          </span>
                        </div>

                        <div className="text-sm text-gray-600">
                          <strong>มีผลถึง:</strong>{" "}
                          {new Date(
                            offer.TripOfferQuotation[0].ValidUntil
                          ).toLocaleDateString("th-TH")}
                        </div>

                        {offer.TripOfferQuotation[0].PriceBreakdown && (
                          <div>
                            <strong className="text-sm">
                              รายละเอียดค่าใช้จ่าย:
                            </strong>
                            <pre className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                              {offer.TripOfferQuotation[0].PriceBreakdown}
                            </pre>
                          </div>
                        )}

                        {offer.TripOfferQuotation[0].Terms && (
                          <div>
                            <strong className="text-sm">
                              เงื่อนไขการให้บริการ:
                            </strong>
                            <pre className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                              {offer.TripOfferQuotation[0].Terms}
                            </pre>
                          </div>
                        )}

                        {offer.TripOfferQuotation[0].PaymentTerms && (
                          <div>
                            <strong className="text-sm">
                              เงื่อนไขการชำระเงิน:
                            </strong>
                            <pre className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                              {offer.TripOfferQuotation[0].PaymentTerms}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {offer.OfferNotes && (
                    <div className="mb-4">
                      <strong className="text-sm">หมายเหตุจากไกด์:</strong>
                      <p className="text-sm text-gray-600 mt-1">
                        {offer.OfferNotes}
                      </p>
                    </div>
                  )}

                  {offer.SentAt && (
                    <div className="text-sm text-gray-500 mb-4">
                      ส่งเมื่อ: {new Date(offer.SentAt).toLocaleString("th-TH")}
                    </div>
                  )}

                  {/* Actions */}
                  {offer.Status === "sent" && tripRequire.Status === "open" && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAcceptOffer(offer.ID)}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
                      >
                        ยอมรับข้อเสนอ
                      </button>
                      <button
                        className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors"
                        onClick={() =>
                          alert("ฟีเจอร์เจรจาต่อรองจะเปิดใช้ในอนาคต")
                        }
                      >
                        เจรจาต่อรอง
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
