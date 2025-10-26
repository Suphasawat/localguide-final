"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripOfferAPI } from "../../lib/api";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface TripOffer {
  ID: number;
  Title: string;
  Description: string;
  Status: string;
  SentAt: string;
  TripRequire: {
    ID: number;
    Title: string;
    User: {
      FirstName: string;
      LastName: string;
    };
  };
  TripOfferQuotation: Array<{
    TotalPrice: number;
    ValidUntil: string;
  }>;
}

export default function MyOffersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<TripOffer[]>([]);
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

    loadMyOffers();
  }, [user, isAuthenticated, router]);

  const loadMyOffers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await tripOfferAPI.getOwn();
      const data = response.data?.offers || response.data?.data || [];
      setOffers(data);
    } catch (error: any) {
      console.error("Failed to load offers:", error);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ข้อเสนอของฉัน
              </h1>
              <p className="mt-2 text-gray-600">
                ดูและจัดการข้อเสนอแพ็กเกจทัวร์ที่คุณส่งไป
              </p>
            </div>
            <Link
              href="/guide/browse-trips"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              เสนอแพ็กเกจใหม่
            </Link>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {offers.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <p className="text-gray-500 text-lg mb-4">
                  คุณยังไม่มีข้อเสนอแพ็กเกจ
                </p>
                <Link
                  href="/guide/browse-trips"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  เริ่มเสนอแพ็กเกจแรก
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <div
                  key={offer.ID}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {offer.Title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          offer.Status
                        )}`}
                      >
                        {getStatusText(offer.Status)}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      สำหรับ: {offer.TripRequire?.Title}
                    </p>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div>
                        👤 ลูกค้า: {offer.TripRequire?.User?.FirstName}{" "}
                        {offer.TripRequire?.User?.LastName}
                      </div>
                      {offer.TripOfferQuotation?.[0] && (
                        <>
                          <div>
                            💰 ราคา:{" "}
                            {offer.TripOfferQuotation[0].TotalPrice?.toLocaleString()}{" "}
                            บาท
                          </div>
                          <div>
                            ⏰ หมดอายุ:{" "}
                            {new Date(
                              offer.TripOfferQuotation[0].ValidUntil
                            ).toLocaleDateString("th-TH")}
                          </div>
                        </>
                      )}
                      {offer.SentAt && (
                        <div>
                          📅 ส่งเมื่อ:{" "}
                          {new Date(offer.SentAt).toLocaleDateString("th-TH")}
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <Link
                        href={`/guide/trip-offers/${offer.ID}`}
                        className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors block"
                      >
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
