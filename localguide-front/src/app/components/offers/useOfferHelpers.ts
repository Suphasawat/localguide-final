export const useOfferHelpers = () => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
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
      case "sent":
        return "รอการตอบรับ";
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

  return {
    getOfferPrice,
    getGuideName,
    getGuideRating,
    getStatusColor,
    getStatusText,
  };
};
