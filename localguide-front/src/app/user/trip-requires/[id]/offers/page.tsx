"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { tripOfferAPI, tripRequireAPI } from "../../../../lib/api";
import { TripRequire, TripOffer } from "../../../../types";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TripRequireInfo from "@/app/components/offers/TripRequireInfo";
import OffersFilterControls from "@/app/components/offers/OffersFilterControls";
import OfferCard from "@/app/components/offers/OfferCard";
import AcceptOfferModal from "@/app/components/offers/AcceptOfferModal";
import RejectOfferModal from "@/app/components/offers/RejectOfferModal";
import { useOfferHelpers } from "@/app/components/offers/useOfferHelpers";
import { useOfferFilters } from "@/app/components/offers/useOfferFilters";
import EmptyOffersState from "@/app/components/offers/EmptyOffersState";
import AcceptedOfferAlert from "@/app/components/offers/AcceptedOfferAlert";

export default function TripOffersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const requireId = params.id as string;

  const [tripRequire, setTripRequire] = useState<TripRequire | null>(null);
  const [offers, setOffers] = useState<TripOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [acceptLoading, setAcceptLoading] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "sent" | "accepted" | "rejected" | "expired" | "withdrawn"
  >("all");
  const [sortBy, setSortBy] = useState<"latest" | "price_low" | "price_high" | "rating_high">("latest");

  const [acceptTarget, setAcceptTarget] = useState<TripOffer | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const [rejectTarget, setRejectTarget] = useState<TripOffer | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState<number | null>(null);

  const helpers = useOfferHelpers();
  const { counts, filtered, sorted, hasAccepted } = useOfferFilters(
    offers,
    statusFilter,
    sortBy,
    helpers.getOfferPrice,
    helpers.getGuideRating
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user?.role !== 1) {
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
      setError("");
      const [requireResponse, offersResponse] = await Promise.all([
        tripRequireAPI.getById(Number(requireId)),
        tripOfferAPI.getByRequire(Number(requireId)),
      ]);

      const requireData = requireResponse.data?.data || requireResponse.data;
      const offersData = offersResponse.data?.offers || offersResponse.data?.data || [];

      setTripRequire(requireData);
      setOffers(offersData);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      setError(error.response?.data?.error || "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const openAccept = (offer: TripOffer) => {
    setAcceptTarget(offer);
    setShowAcceptModal(true);
  };

  const openReject = (offer: TripOffer) => {
    setRejectTarget(offer);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleAcceptOffer = async (offerId: number) => {
    setAcceptLoading(offerId);
    setError("");
    setSuccess("");
    try {
      await tripOfferAPI.accept(offerId);
      setSuccess("ยอมรับข้อเสนอเรียบร้อยแล้ว กำลังนำท่านไปยังหน้าการจอง...");
      setShowAcceptModal(false);
      setAcceptTarget(null);
      setTimeout(() => {
        router.push("/trip-bookings");
      }, 1500);
    } catch (error: any) {
      console.error("Failed to accept offer:", error);
      setError(error.response?.data?.error || "ไม่สามารถยอมรับข้อเสนอได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setAcceptLoading(null);
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    setRejectLoading(offerId);
    setError("");
    setSuccess("");
    try {
      await tripOfferAPI.reject(offerId, rejectReason ? { reason: rejectReason } : undefined);
      setShowRejectModal(false);
      setRejectTarget(null);
      setSuccess("ปฏิเสธข้อเสนอเรียบร้อยแล้ว");
      await loadData();
    } catch (error: any) {
      console.error("Failed to reject offer:", error);
      setError(error.response?.data?.error || "ไม่สามารถปฏิเสธข้อเสนอได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setRejectLoading(null);
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
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* ✅ Green Header (ธีมเดียวกับทั้งระบบ) */}
        <div className="w-full bg-emerald-600 text-white rounded-b-2xl shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white/80 text-sm uppercase tracking-wide">รายการข้อเสนอ</p>
              <h1 className="text-3xl font-extrabold leading-tight">ข้อเสนอที่ได้รับ</h1>
              <p className="mt-1 text-white/90 text-sm">สำหรับ: {tripRequire.Title}</p>
            </div>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-full font-semibold shadow-sm hover:bg-emerald-50 transition-all"
            >
              ← กลับ
            </button>
          </div>
        </div>

        {/* ✅ Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TripRequireInfo
            tripRequire={tripRequire}
            offers={offers}
            getStatusColor={helpers.getStatusColor}
            getStatusText={helpers.getStatusText}
          />

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✅ {success}
            </div>
          )}

          <EmptyOffersState hasOffers={offers.length > 0} />

          {offers.length > 0 && (
            <div className="space-y-6">
              <OffersFilterControls
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filteredCount={filtered.length}
                totalCount={offers.length}
                counts={counts}
              />

              <AcceptedOfferAlert show={hasAccepted} />

              {sorted.map((offer) => (
                <OfferCard
                  key={offer.ID}
                  offer={offer}
                  tripRequire={tripRequire}
                  getGuideName={helpers.getGuideName}
                  getOfferPrice={helpers.getOfferPrice}
                  getGuideRating={helpers.getGuideRating}
                  getStatusColor={helpers.getStatusColor}
                  getStatusText={helpers.getStatusText}
                  onAccept={openAccept}
                  onReject={openReject}
                />
              ))}
            </div>
          )}
        </div>

        <AcceptOfferModal
          show={showAcceptModal}
          offer={acceptTarget}
          onClose={() => setShowAcceptModal(false)}
          onConfirm={handleAcceptOffer}
          loading={acceptLoading === acceptTarget?.ID}
          getGuideName={helpers.getGuideName}
          getOfferPrice={helpers.getOfferPrice}
        />

        <RejectOfferModal
          show={showRejectModal}
          offer={rejectTarget}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleRejectOffer}
          loading={rejectLoading === rejectTarget?.ID}
          reason={rejectReason}
          setReason={setRejectReason}
          getGuideName={helpers.getGuideName}
        />
      </div>
      <Footer />
    </>
  );
}
