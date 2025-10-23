"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { tripOfferAPI, tripRequireAPI } from "../../../../lib/api";
import { TripRequire, TripOffer } from "../../../../types";
import Navbar from "@/app/components/Navbar";

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
  const [selectedOffer, setSelectedOffer] = useState<TripOffer | null>(null);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  // New: filter & sort states
  const [statusFilter, setStatusFilter] = useState<
    | "all"
    | "sent"
    | "negotiating"
    | "accepted"
    | "rejected"
    | "expired"
    | "withdrawn"
  >("all");
  const [sortBy, setSortBy] = useState<
    "latest" | "price_low" | "price_high" | "rating_high"
  >("latest");

  // Helpers to read optional fields safely
  const getOfferPrice = (o: any) => {
    const q =
      o?.Quotation ||
      (Array.isArray(o?.TripOfferQuotation)
        ? o.TripOfferQuotation[o.TripOfferQuotation.length - 1]
        : undefined);
    return q?.TotalPrice ?? o?.TotalPrice ?? null;
  };
  const getGuideName = (o: any) => {
    const u = o?.Guide?.User;
    if (u?.FirstName || u?.LastName)
      return `${u?.FirstName || ""} ${u?.LastName || ""}`.trim();
    return o?.GuideName || o?.guide_name || "ไกด์ไม่ระบุชื่อ";
  };
  const getGuideRating = (o: any) => o?.Guide?.Rating ?? null;

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

      // Handle different API response structures
      const requireData = requireResponse.data?.data || requireResponse.data;
      const offersData =
        offersResponse.data?.offers || offersResponse.data?.data || [];

      setTripRequire(requireData);
      setOffers(offersData);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      setError(
        error.response?.data?.error ||
          "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง"
      );
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

    setAcceptLoading(offerId);
    setError("");
    setSuccess("");

    try {
      await tripOfferAPI.accept(offerId);
      setSuccess("ยอมรับข้อเสนอเรียบร้อยแล้ว กำลังนำท่านไปยังหน้าการจอง...");

      // Delay before redirect to show success message
      setTimeout(() => {
        router.push("/trip-bookings");
      }, 2000);
    } catch (error: any) {
      console.error("Failed to accept offer:", error);
      setError(
        error.response?.data?.error ||
          "ไม่สามารถยอมรับข้อเสนอได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setAcceptLoading(null);
    }
  };

  const handleNegotiate = (offer: TripOffer) => {
    setSelectedOffer(offer);
    setShowNegotiateModal(true);
  };

  const handleRejectOffer = async (offerId: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะปฏิเสธข้อเสนอนี้?")) {
      return;
    }

    // TODO: Implement reject offer API
    alert("ฟีเจอร์ปฏิเสธข้อเสนอจะเปิดใช้ในอนาคต");
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
      case "withdrawn":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "รอการตอบรับ";
      case "negotiating":
        return "กำลังเจรจา";
      case "accepted":
        return "ยอมรับแล้ว";
      case "rejected":
        return "ปฏิเสธแล้ว";
      case "expired":
        return "หมดอายุ";
      case "withdrawn":
        return "ถอนข้อเสนอ";
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

  if (!tripRequire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">ไม่พบข้อมูลความต้องการทริป</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Navbar />
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-lg">{tripRequire.Title}</h3>
              <p className="text-gray-600 mt-2">{tripRequire.Description}</p>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                tripRequire.Status
              )}`}
            >
              {getStatusText(tripRequire.Status)}
            </span>
          </div>

          {/* Statistics */}
          {offers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {offers.length}
                </div>
                <div className="text-sm text-gray-600">ข้อเสนอทั้งหมด</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {offers.filter((offer) => offer.Status === "sent").length}
                </div>
                <div className="text-sm text-gray-600">รอการตอบรับ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {offers.filter((offer) => offer.Status === "accepted").length}
                </div>
                <div className="text-sm text-gray-600">ยอมรับแล้ว</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {offers.filter((offer) => offer.Status === "rejected").length}
                </div>
                <div className="text-sm text-gray-600">ปฏิเสธแล้ว</div>
              </div>
            </div>
          )}
        </div>

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

        {offers.length === 0 ? (
          // Empty state
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg mb-2">
              ยังไม่มีข้อเสนอสำหรับความต้องการนี้
            </p>
            <p className="text-gray-400">โปรดรอไกด์ส่งข้อเสนอมาให้</p>
          </div>
        ) : (
          (() => {
            const counts = {
              sent: offers.filter((o) => o.Status === "sent").length,
              negotiating: offers.filter((o) => o.Status === "negotiating")
                .length,
              accepted: offers.filter((o) => o.Status === "accepted").length,
              rejected: offers.filter((o) => o.Status === "rejected").length,
              expired: offers.filter((o) => o.Status === "expired").length,
              withdrawn: offers.filter((o) => o.Status === "withdrawn").length,
            };

            const filtered =
              statusFilter === "all"
                ? offers
                : offers.filter((o) => o.Status === statusFilter);

            const sorted = [...filtered].sort((a, b) => {
              if (sortBy === "price_low" || sortBy === "price_high") {
                const pa = getOfferPrice(a) ?? Number.POSITIVE_INFINITY;
                const pb = getOfferPrice(b) ?? Number.POSITIVE_INFINITY;
                return sortBy === "price_low" ? pa - pb : pb - pa;
              }
              if (sortBy === "rating_high") {
                const ra = getGuideRating(a) ?? -1;
                const rb = getGuideRating(b) ?? -1;
                return rb - ra;
              }
              // latest by SentAt desc as default
              return (
                new Date(b.SentAt || 0).getTime() -
                new Date(a.SentAt || 0).getTime()
              );
            });

            const hasAccepted = counts.accepted > 0;

            return (
              <div className="space-y-6">
                {/* Controls: filter chips + sort */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ข้อเสนอทั้งหมด ({filtered.length} จาก {offers.length})
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {(
                      [
                        { key: "all", label: "ทั้งหมด", count: offers.length },
                        {
                          key: "sent",
                          label: "รอการตอบรับ",
                          count: counts.sent,
                        },
                        {
                          key: "negotiating",
                          label: "กำลังเจรจา",
                          count: counts.negotiating,
                        },
                        {
                          key: "accepted",
                          label: "ยอมรับแล้ว",
                          count: counts.accepted,
                        },
                        {
                          key: "rejected",
                          label: "ปฏิเสธแล้ว",
                          count: counts.rejected,
                        },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setStatusFilter(f.key as any)}
                        className={`px-3 py-1 rounded-full text-sm border transition ${
                          statusFilter === f.key
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {f.label}{" "}
                        <span className="ml-1 opacity-80">({f.count})</span>
                      </button>
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                      <label className="text-sm text-gray-600">เรียงตาม</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
                      >
                        <option value="latest">วันที่ส่งล่าสุด</option>
                        <option value="price_low">ราคาต่ำสุด</option>
                        <option value="price_high">ราคาสูงสุด</option>
                        <option value="rating_high">เรตติ้งไกด์สูงสุด</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Accepted highlight */}
                {hasAccepted && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                    ✅ คุณได้ยอมรับข้อเสนอแล้ว สามารถตรวจสอบการจองได้ที่หน้า
                    "การจองทริป"
                  </div>
                )}

                {sorted.map((offer) => (
                  <div
                    key={offer.ID}
                    className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
                      offer.Status === "accepted"
                        ? "border-green-500"
                        : offer.Status === "rejected"
                        ? "border-red-500"
                        : offer.Status === "negotiating"
                        ? "border-yellow-500"
                        : offer.Status === "expired"
                        ? "border-gray-400"
                        : "border-blue-500"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {offer.Title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            จาก: {getGuideName(offer)}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <span
                            className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                              offer.Status
                            )}`}
                          >
                            {getStatusText(offer.Status)}
                          </span>
                          {getOfferPrice(offer) !== null && (
                            <div>
                              <div className="text-xs text-gray-500">
                                ราคารวม
                              </div>
                              <div className="text-base font-bold text-gray-900">
                                ฿{Number(getOfferPrice(offer)).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700">{offer.Description}</p>
                      </div>

                      {/* Guide Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium mb-2">ข้อมูลไกด์</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            ⭐ คะแนน: {getGuideRating(offer) ?? "ยังไม่มี"}/5
                          </div>
                          <div>
                            💰 ราคาไกด์: {offer.Guide?.Price?.toLocaleString()}{" "}
                            บาท/วัน
                          </div>
                        </div>
                      </div>

                      {/* Quotation */}
                      {(offer.Quotation || offer.TripOfferQuotation?.[0]) && (
                        <div className="border border-gray-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium mb-3">💰 ใบเสนอราคา</h4>
                          {(() => {
                            const quotation =
                              offer.Quotation || offer.TripOfferQuotation?.[0];
                            if (!quotation) return null;

                            return (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">ราคารวม:</span>
                                  <span className="text-xl font-bold text-green-600">
                                    {quotation.TotalPrice?.toLocaleString()} บาท
                                  </span>
                                </div>

                                <div className="text-sm text-gray-600">
                                  <strong>มีผลถึง:</strong>{" "}
                                  {new Date(
                                    quotation.ValidUntil
                                  ).toLocaleDateString("th-TH")}
                                </div>

                                {quotation.PriceBreakdown && (
                                  <div>
                                    <strong className="text-sm">
                                      📊 รายละเอียดค่าใช้จ่าย:
                                    </strong>
                                    <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">
                                      <pre className="whitespace-pre-wrap font-sans">
                                        {quotation.PriceBreakdown}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                {quotation.Terms && (
                                  <div>
                                    <strong className="text-sm">
                                      📋 เงื่อนไขการให้บริการ:
                                    </strong>
                                    <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">
                                      <pre className="whitespace-pre-wrap font-sans">
                                        {quotation.Terms}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                {quotation.PaymentTerms && (
                                  <div>
                                    <strong className="text-sm">
                                      💳 เงื่อนไขการชำระเงิน:
                                    </strong>
                                    <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">
                                      <pre className="whitespace-pre-wrap font-sans">
                                        {quotation.PaymentTerms}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {offer.OfferNotes && (
                        <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                          <strong className="text-sm text-blue-900">
                            หมายเหตุจากไกด์:
                          </strong>
                          <p className="text-sm text-blue-700 mt-2 whitespace-pre-wrap">
                            {offer.OfferNotes}
                          </p>
                        </div>
                      )}

                      {/* Itinerary */}
                      {offer.Itinerary && (
                        <div className="mb-4">
                          <strong className="text-sm">
                            กำหนดการท่องเที่ยว:
                          </strong>
                          <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap font-sans">
                              {offer.Itinerary}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Services */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {offer.IncludedServices && (
                          <div>
                            <strong className="text-sm text-green-700">
                              ✅ บริการที่รวมอยู่:
                            </strong>
                            <div className="text-sm text-gray-600 mt-2 bg-green-50 p-3 rounded-lg">
                              <pre className="whitespace-pre-wrap font-sans">
                                {offer.IncludedServices}
                              </pre>
                            </div>
                          </div>
                        )}
                        {offer.ExcludedServices && (
                          <div>
                            <strong className="text-sm text-red-700">
                              ❌ บริการที่ไม่รวม:
                            </strong>
                            <div className="text-sm text-gray-600 mt-2 bg-red-50 p-3 rounded-lg">
                              <pre className="whitespace-pre-wrap font-sans">
                                {offer.ExcludedServices}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>

                      {offer.SentAt && (
                        <div className="text-sm text-gray-500 mb-4">
                          ส่งเมื่อ:{" "}
                          {new Date(offer.SentAt).toLocaleDateString("th-TH")}{" "}
                          {new Date(offer.SentAt).toLocaleTimeString("th-TH")}
                        </div>
                      )}

                      {/* Actions */}
                      {offer.Status === "sent" &&
                        (tripRequire.Status === "open" ||
                          tripRequire.Status === "in_review") && (
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                              onClick={() => handleAcceptOffer(offer.ID)}
                              disabled={acceptLoading === offer.ID}
                              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              {acceptLoading === offer.ID ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  กำลังยอมรับ...
                                </>
                              ) : (
                                <>✅ ยอมรับข้อเสนอ</>
                              )}
                            </button>
                            <button
                              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                              onClick={() => handleNegotiate(offer)}
                            >
                              💬 เจรจาต่อรอง
                            </button>
                            <button
                              className="flex-1 bg-gray-400 text-white py-3 px-4 rounded-md hover:bg-gray-500 transition-colors"
                              onClick={() => handleRejectOffer(offer.ID)}
                            >
                              ❌ ปฏิเสธ
                            </button>
                          </div>
                        )}

                      {offer.Status === "sent" &&
                        tripRequire.Status !== "open" &&
                        tripRequire.Status !== "in_review" && (
                          <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md">
                            <span className="mr-2">🔒</span>
                            ความต้องการนี้ปิดรับข้อเสนอแล้ว (Status:{" "}
                            {tripRequire.Status})
                          </div>
                        )}

                      {offer.Status === "negotiating" && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md flex items-center">
                          <span className="mr-2">🔄</span>
                          กำลังเจรจาต่อรองข้อเสนอนี้
                          <button
                            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => handleNegotiate(offer)}
                          >
                            ดูการเจรจา
                          </button>
                        </div>
                      )}

                      {offer.Status === "accepted" && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
                          <span className="mr-2">✅</span>
                          คุณได้ยอมรับข้อเสนอนี้แล้ว
                        </div>
                      )}

                      {offer.Status === "rejected" && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                          <span className="mr-2">❌</span>
                          ข้อเสนอนี้ถูกปฏิเสธแล้ว
                          {offer.RejectionReason && (
                            <span className="ml-2 text-sm">
                              ({offer.RejectionReason})
                            </span>
                          )}
                        </div>
                      )}

                      {offer.Status === "expired" && (
                        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md flex items-center">
                          <span className="mr-2">⏰</span>
                          ข้อเสนอนี้หมดอายุแล้ว
                        </div>
                      )}

                      {offer.Status === "withdrawn" && (
                        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md flex items-center">
                          <span className="mr-2">🚫</span>
                          ไกด์ได้ถอนข้อเสนอนี้แล้ว
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>

      {/* Negotiate Modal */}
      {showNegotiateModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold">💬 เจรจาต่อรองข้อเสนอ</h3>
                <button
                  onClick={() => setShowNegotiateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">{selectedOffer.Title}</h4>
                <p className="text-sm text-gray-600">
                  จาก: {selectedOffer.Guide?.User?.FirstName}{" "}
                  {selectedOffer.Guide?.User?.LastName}
                </p>
                {selectedOffer.Quotation && (
                  <p className="text-lg font-semibold text-green-600 mt-2">
                    ราคาปัจจุบัน:{" "}
                    {selectedOffer.Quotation.TotalPrice?.toLocaleString()} บาท
                  </p>
                )}
              </div>

              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🚧</div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  ฟีเจอร์เจรจาต่อรองยังไม่พร้อมใช้งาน
                </h4>
                <p className="text-gray-500 mb-6">
                  ขณะนี้ระบบเจรจาต่อรองยังอยู่ระหว่างการพัฒนา
                  <br />
                  คุณสามารถติดต่อไกด์โดยตรงหรือยอมรับข้อเสนอนี้ได้เลย
                </p>

                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => setShowNegotiateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    ปิด
                  </button>
                  <button
                    onClick={() => {
                      setShowNegotiateModal(false);
                      handleAcceptOffer(selectedOffer.ID);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ยอมรับข้อเสนอนี้
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
