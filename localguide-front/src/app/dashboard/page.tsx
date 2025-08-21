"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "../components/Loading";
import { tripRequireAPI, tripBookingAPI } from "../lib/api";
import { TripRequire, TripBooking, User, Guide } from "../types";

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tripRequires, setTripRequires] = useState<TripRequire[]>([]);
  const [bookings, setBookings] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Helpers to normalize API shapes ---
  const extractArray = (resp: any, preferredKeys: string[]): any[] => {
    const containers = [resp?.data, resp];
    for (const c of containers) {
      if (!c) continue;
      for (const k of preferredKeys) {
        if (Array.isArray((c as any)?.[k])) return (c as any)[k];
      }
      if (Array.isArray(c)) return c;
    }
    return [];
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load trip requires for users (role 1)
      if (user?.role === 1) {
        try {
          const tripRequiresResponse = await tripRequireAPI.getOwn();
          const requires = extractArray(tripRequiresResponse, [
            "tripRequires",
            "trip_requires",
            "requires",
            "items",
            "results",
            "data",
          ]);
          setTripRequires(
            Array.isArray(requires) ? (requires as TripRequire[]) : []
          );
        } catch (err) {
          console.error("Failed to load trip requires:", err);
          setTripRequires([]);
        }
      } else {
        setTripRequires([]);
      }

      // Load bookings for everyone
      try {
        const bookingsResponse = await tripBookingAPI.getAll();
        const list = extractArray(bookingsResponse, [
          "bookings",
          "data",
          "items",
          "results",
        ]);
        setBookings(Array.isArray(list) ? (list as TripBooking[]) : []);
      } catch (err) {
        console.error("Failed to load bookings:", err);
        setBookings([]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Field getters for robustness ---
  const fullName = (u?: User) =>
    u ? `${u.FirstName ?? ""} ${u.LastName ?? ""}`.trim() : "";

  const getRequireId = (r: any) => r?.ID ?? r?.id;
  const getRequireTitle = (r: any) =>
    r?.Title ??
    r?.title ??
    r?.trip_title ??
    r?.trip_require_title ??
    "ไม่ระบุหัวข้อ";
  const getRequireProvince = (r: any) =>
    r?.Province?.Name ??
    r?.province?.Name ??
    r?.province_name ??
    r?.ProvinceName ??
    (typeof r?.Province === "string" ? r?.Province : undefined) ??
    (typeof r?.province === "string" ? r?.province : undefined) ??
    "ไม่ระบุจังหวัด";
  const getRequireDates = (r: any) => {
    const start = r?.StartDate ?? r?.start_date;
    const end = r?.EndDate ?? r?.end_date;
    return { start, end };
  };
  const getRequireStatus = (r: any) => r?.Status ?? r?.status ?? "unknown";
  const getRequireOffers = (r: any) =>
    r?.total_offers ?? r?.TotalOffers ?? r?.totalOffers ?? 0;

  const getBookingId = (b: any) => b?.id ?? b?.ID;
  const getBookingStatus = (b: any) => b?.status ?? b?.Status ?? "unknown";
  const getBookingDate = (b: any) => b?.start_date ?? b?.StartDate ?? "";
  const getBookingTitle = (b: any) =>
    b?.trip_title ??
    b?.TripTitle ??
    b?.trip_require_title ??
    b?.TripRequireTitle ??
    null;
  const getProvinceNameFromBooking = (b: any) =>
    b?.province_name ??
    b?.ProvinceName ??
    b?.TripOffer?.TripRequire?.Province?.Name ??
    b?.TripOffer?.TripRequire?.province_name ??
    undefined;
  const getGuideFromBooking = (b: any): Guide | undefined =>
    b?.Guide ?? b?.TripOffer?.Guide;
  const getUserFromBooking = (b: any): User | undefined =>
    b?.User ?? b?.TripOffer?.TripRequire?.User;
  const getGuideName = (b: any) =>
    b?.guide_name ?? b?.GuideName ?? fullName(getGuideFromBooking(b)?.User);
  const getUserName = (b: any) =>
    b?.user_name ?? b?.UserName ?? fullName(getUserFromBooking(b));

  if (authLoading || loading) {
    return <Loading text="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          สวัสดี, {user.FirstName} {user.LastName}
        </h1>
        <p className="text-gray-600 mt-2">
          {user.role === 2
            ? "แดชบอร์ดสำหรับไกด์"
            : "แดชบอร์ดสำหรับนักท่องเที่ยว"}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {user.role === 2 ? (
          <>
            <Link
              href="/guide/browse-trips"
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center"
            >
              <h3 className="text-lg font-semibold mb-2">
                ดูความต้องการเที่ยว
              </h3>
              <p className="text-sm opacity-90">หาโอกาสงานใหม่</p>
            </Link>
            <Link
              href="/guide/my-offers"
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center"
            >
              <h3 className="text-lg font-semibold mb-2">ข้อเสนอของฉัน</h3>
              <p className="text-sm opacity-90">จัดการข้อเสนอ</p>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/user/trip-requires/create"
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center"
            >
              <h3 className="text-lg font-semibold mb-2">โพสต์ความต้องการ</h3>
              <p className="text-sm opacity-90">หาไกด์ใหม่</p>
            </Link>
            <Link
              href="/user/trip-requires"
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center"
            >
              <h3 className="text-lg font-semibold mb-2">โพสต์ของฉัน</h3>
              <p className="text-sm opacity-90">จัดการความต้องการเที่ยว</p>
            </Link>
            <Link
              href="/become-guide"
              className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg text-center"
            >
              <h3 className="text-lg font-semibold mb-2">สมัครเป็นไกด์</h3>
              <p className="text-sm opacity-90">เริ่มต้นสร้างรายได้</p>
            </Link>
          </>
        )}

        <Link
          href="/trip-bookings"
          className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center"
        >
          <h3 className="text-lg font-semibold mb-2">การจองของฉัน</h3>
          <p className="text-sm opacity-90">ดูและจัดการการจอง</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Trip Requires (for users) */}
        {user.role === 1 && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">โพสต์ความต้องการเที่ยว</h2>
              <Link
                className="text-blue-600 hover:underline"
                href="/user/trip-requires"
              >
                ดูทั้งหมด
              </Link>
            </div>
            {tripRequires.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีโพสต์ความต้องการ</p>
            ) : (
              <ul className="divide-y">
                {tripRequires.map((r) => {
                  const id = getRequireId(r);
                  const { start, end } = getRequireDates(r);
                  return (
                    <li
                      key={id}
                      className="py-4 flex items-start justify-between gap-4"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getRequireTitle(r)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {getRequireProvince(r)} • {start || "?"}
                          {end ? ` - ${end}` : ""}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          สถานะ: {getRequireStatus(r)} • ข้อเสนอ:{" "}
                          {getRequireOffers(r)}
                        </p>
                      </div>
                      {id ? (
                        <Link
                          href={`/user/trip-requires/${id}`}
                          className="text-blue-600 hover:underline text-sm whitespace-nowrap"
                        >
                          ดูรายละเอียด
                        </Link>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Bookings */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">การจองล่าสุด</h2>
            <Link
              className="text-blue-600 hover:underline"
              href="/trip-bookings"
            >
              ดูทั้งหมด
            </Link>
          </div>
          {bookings.length === 0 ? (
            <p className="text-gray-500">ยังไม่มีกิจกรรมการจอง</p>
          ) : (
            <ul className="divide-y">
              {bookings.map((b) => {
                const id = getBookingId(b);
                const title =
                  getBookingTitle(b) ||
                  (getProvinceNameFromBooking(b)
                    ? `${getProvinceNameFromBooking(b)} • ${
                        getBookingDate(b) || "?"
                      }`
                    : `การจอง #${id}`);
                const counterpart =
                  user.role === 2 ? getUserName(b) : getGuideName(b);
                return (
                  <li
                    key={id}
                    className="py-4 flex items-start justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        สถานะ: {getBookingStatus(b)}
                        {counterpart ? ` • คู่สนทนา: ${counterpart}` : ""}
                      </p>
                    </div>
                    {id ? (
                      <Link
                        href={`/trip-bookings/${id}`}
                        className="text-blue-600 hover:underline text-sm whitespace-nowrap"
                      >
                        ดูรายละเอียด
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
