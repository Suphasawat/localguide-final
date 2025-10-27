import type { TripBooking as TripBookingType } from "@/app/types";

export const useBookingHelpers = () => {
  // Safe getters for mixed shapes
  const getId = (b: any) => b?.ID ?? b?.id;
  const getStatus = (b: any) => b?.Status ?? b?.status ?? "";
  const getPaymentStatus = (b: any) =>
    b?.PaymentStatus ?? b?.payment_status ?? "";
  const getTotal = (b: any) => b?.TotalAmount ?? b?.total_amount ?? 0;
  const getStartDate = (b: any) => b?.StartDate ?? b?.start_date ?? "";
  const getProvince = (b: any) =>
    b?.TripOffer?.TripRequire?.Province?.Name ??
    b?.province_name ??
    b?.ProvinceName ??
    "-";
  const getTripTitle = (b: any) =>
    b?.TripOffer?.Title ??
    b?.trip_title ??
    b?.TripTitle ??
    `การจอง #${getId(b)}`;
  const getTripRequireTitle = (b: any) =>
    b?.TripOffer?.TripRequire?.Title ?? b?.trip_require_title ?? "-";
  const getTripDays = (b: any) => b?.TripOffer?.TripRequire?.Days ?? "-";
  const getUserName = (b: any) => {
    const u = b?.User;
    if (u?.FirstName || u?.LastName)
      return `${u?.FirstName || ""} ${u?.LastName || ""}`.trim();
    return b?.user_name ?? b?.UserName ?? "-";
  };
  const getGuideName = (b: any) => {
    const g = b?.Guide?.User;
    if (g?.FirstName || g?.LastName)
      return `${g?.FirstName || ""} ${g?.LastName || ""}`.trim();
    return b?.guide_name ?? b?.GuideName ?? "-";
  };
  const getUserPhone = (b: any) => b?.User?.Phone ?? "-";
  const getGuidePhone = (b: any) => b?.Guide?.User?.Phone ?? "-";
  const getSpecialRequests = (b: any) =>
    b?.SpecialRequests ?? b?.special_requests ?? "";
  const getNotes = (b: any) => b?.Notes ?? b?.notes ?? "";
  const getUserIdFromBooking = (b: any) =>
    b?.User?.ID ?? b?.user_id ?? b?.UserID;
  const getGuideIdFromBooking = (b: any) =>
    b?.GuideID ?? b?.guide_id ?? b?.Guide?.User?.ID;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "trip_started":
        return "bg-green-100 text-green-800";
      case "trip_completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "รอชำระเงิน";
      case "paid":
        return "ชำระแล้ว";
      case "trip_started":
        return "เริ่มทริปแล้ว";
      case "trip_completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      case "no_show":
        return "ลูกค้าไม่มา";
      default:
        return status || "-";
    }
  };

  return {
    getId,
    getStatus,
    getPaymentStatus,
    getTotal,
    getStartDate,
    getProvince,
    getTripTitle,
    getTripRequireTitle,
    getTripDays,
    getUserName,
    getGuideName,
    getUserPhone,
    getGuidePhone,
    getSpecialRequests,
    getNotes,
    getUserIdFromBooking,
    getGuideIdFromBooking,
    getStatusColor,
    getStatusText,
  };
};
