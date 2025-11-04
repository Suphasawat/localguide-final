"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { tripOfferAPI } from "../../../lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import OfferHeader from "@/app/components/trip-offer-detail/OfferHeader";
import TripRequirementInfo from "@/app/components/trip-offer-detail/TripRequirementInfo";
import OfferDetails from "@/app/components/trip-offer-detail/OfferDetails";
import QuotationCard from "@/app/components/trip-offer-detail/QuotationCard";
import StatusAlert from "@/app/components/trip-offer-detail/StatusAlert";

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
          <OfferHeader
            title={offer.Title}
            sentAt={offer.SentAt}
            status={offer.Status}
            onBack={() => router.push("/guide/my-offers")}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />

          {/* Trip Requirement Info */}
          <TripRequirementInfo tripRequire={offer.TripRequire} />

          {/* Offer Details */}
          <OfferDetails
            description={offer.Description}
            itinerary={offer.Itinerary}
            includedServices={offer.IncludedServices}
            excludedServices={offer.ExcludedServices}
            offerNotes={offer.OfferNotes}
          />

          {/* Quotation */}
          {latestQuotation && <QuotationCard quotation={latestQuotation} />}

          {/* Status Messages */}
          <StatusAlert status={offer.Status} />

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
