import { TripRequire } from "./useBrowseTrips";

export function formatThaiDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

export function formatBaht(n: number) {
  return n.toLocaleString("th-TH");
}

export function getProvinceName(trip: TripRequire) {
  return trip.province_name || trip.Province?.Name || "ไม่ระบุจังหวัด";
}

export function getCustomerName(trip: TripRequire) {
  return trip.user_name && trip.user_name.trim().length > 0
    ? trip.user_name
    : "ผู้ใช้ไม่ระบุชื่อ";
}
