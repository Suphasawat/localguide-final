"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";
import DashboardStats from "../components/dashboard/DashboardStats";
import QuickActions from "../components/dashboard/QuickActions";
import RecentTripRequires from "../components/dashboard/RecentTripRequires";
import RecentBookings from "../components/dashboard/RecentBookings";

// นำ API มาใช้
import { tripRequireAPI, tripBookingAPI } from "../lib/api";

// นำ Type มาใช้ (เพื่อให้โค้ดอ่านง่ายและปลอดภัย)
import type { TripRequire, TripBooking } from "../types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // สถานะบทบาท
  const isUser = user?.role === 1;
  const isGuide = user?.role === 2;
  const isAdmin = user?.role === 3;

  // state สำหรับข้อมูลประวัติ
  const [myTripRequires, setMyTripRequires] = useState<TripRequire[]>([]);
  const [myBookings, setMyBookings] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // ถ้าไม่ล็อกอินให้ไปหน้าเข้าสู่ระบบ
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // โหลด “ประวัติ” จาก backend แบบง่าย ๆ
  useEffect(() => {
    if (!user) return;

    async function loadHistory() {
      setLoading(true);
      try {
        // ผู้ใช้ทั่วไป: โหลดความต้องการเที่ยวของฉัน
        if (isUser) {
          const resRequires = await tripRequireAPI.getOwn();
          if (
            resRequires &&
            resRequires.data &&
            Array.isArray(resRequires.data.tripRequires)
          ) {
            setMyTripRequires(resRequires.data.tripRequires as TripRequire[]);
          } else {
            setMyTripRequires([]);
          }
        } else {
          setMyTripRequires([]);
        }

        // ทุกบทบาท: โหลดการจองล่าสุดของฉัน
        const resBookings = await tripBookingAPI.getAll();
        if (
          resBookings &&
          resBookings.data &&
          Array.isArray(resBookings.data.bookings)
        ) {
          setMyBookings(resBookings.data.bookings as TripBooking[]);
        } else {
          setMyBookings([]);
        }
      } catch (err) {
        console.error("Load dashboard history error:", err);
        setMyTripRequires([]);
        setMyBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [user, isUser]);

  if (authLoading || loading) {
    return <Loading text="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  // ชื่อผู้ใช้แบบ “ชื่อเดียว”
  let displayName = "ยินดีต้อนรับ";
  if ((user as any).FirstName) {
    displayName = (user as any).FirstName as string;
  }

  // หัวข้อของแดชบอร์ด
  let dashboardTitle = "แดชบอร์ดสำหรับนักท่องเที่ยว";
  if (isGuide) {
    dashboardTitle = "แดชบอร์ดสำหรับไกด์";
  } else if (isAdmin) {
    dashboardTitle = "แดชบอร์ดสำหรับผู้ดูแลระบบ";
  }

  // Helpers
  const getProvince = (r: any) =>
    r.province_name || r.Province?.Name || "ไม่ระบุจังหวัด";
  const getDateRange = (r: any) => {
    const s = r.StartDate || r.start_date || "-";
    const e = r.EndDate || r.end_date || "";
    return s + (e ? ` - ${e}` : "");
  };

  // Statistics
  const openRequires = isUser
    ? myTripRequires.filter((r: any) => (r.Status || r.status) === "open")
        .length
    : 0;
  const pendingPayments = myBookings.filter(
    (b: any) => (b.Status || b.status) === "pending_payment"
  ).length;

  return (
    <>
      <Navbar />

      {/* HERO with Stats - Emerald Gradient like About page */}
      <DashboardStats
        displayName={displayName}
        dashboardTitle={dashboardTitle}
        totalBookings={myBookings.length}
        pendingPayments={pendingPayments}
        totalRequires={myTripRequires.length}
        openRequires={openRequires}
        isUser={isUser}
        isGuide={isGuide}
      />

      {/* Main Content - White background */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-10">
          {/* Quick Actions */}
          <QuickActions isUser={isUser} isGuide={isGuide} isAdmin={isAdmin} />

          {/* Recent History Sections */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* User: Recent Trip Requires */}
            {isUser && (
              <RecentTripRequires
                tripRequires={myTripRequires}
                getProvince={getProvince}
                getDateRange={getDateRange}
              />
            )}

            {(isUser || isGuide) && (
              <RecentBookings bookings={myBookings} isGuide={isGuide} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
