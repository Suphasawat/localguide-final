import type { TripBooking as TripBookingType } from "../../types";

export function getStatusColor(status: string) {
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
}

export function getStatusText(status: string) {
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
}

export const getId = (b: TripBookingType) => (b as any).ID ?? (b as any).id;

export const getTitle = (b: TripBookingType) =>
  (b as any).TripOffer?.Title ||
  (b as any).trip_title ||
  (b as any).TripTitle ||
  `การจอง #${getId(b)}`;

export const getProvince = (b: TripBookingType) =>
  (b as any).TripOffer?.TripRequire?.Province?.Name ||
  (b as any).province_name ||
  (b as any).ProvinceName ||
  "-";

export const getStatusVal = (b: TripBookingType) =>
  (b as any).Status || (b as any).status || "";

export const getTotal = (b: TripBookingType) =>
  (b as any).TotalAmount ?? (b as any).total_amount ?? 0;

export const getUserName = (b: TripBookingType) => {
  const u = (b as any).User;
  if (u?.FirstName || u?.LastName)
    return `${u?.FirstName || ""} ${u?.LastName || ""}`.trim();
  return (b as any).user_name || (b as any).UserName || "-";
};

export const getGuideName = (b: TripBookingType) => {
  const g = (b as any).Guide?.User;
  if (g?.FirstName || g?.LastName)
    return `${g?.FirstName || ""} ${g?.LastName || ""}`.trim();
  return (b as any).guide_name || (b as any).GuideName || "-";
};
