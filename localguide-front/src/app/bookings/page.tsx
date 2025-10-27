"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripBookingAPI } from "../lib/api";
import { TripBooking } from "../types";
import Loading from "@/app/components/Loading";
import BookingsFilters from "@/app/components/bookings/BookingsFilters";
import BookingCard from "@/app/components/bookings/BookingCard";
import BookingsStats from "@/app/components/bookings/BookingsStats";
import EmptyBookings from "@/app/components/bookings/EmptyBookings";

export default function BookingsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    status: "",
    paymentStatus: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      loadBookings();
    }
  }, [user, authLoading, isAuthenticated, router]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await tripBookingAPI.getAll();
      setBookings(response.data?.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setError("ไม่สามารถโหลดข้อมูลการจองได้");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (bookingId: number, action: string) => {
    try {
      switch (action) {
        case "confirm_guide_arrival":
          await tripBookingAPI.confirmGuideArrival(bookingId);
          break;
        case "confirm_trip_complete":
          await tripBookingAPI.confirmTripComplete(bookingId);
          break;
        case "report_no_show":
          await tripBookingAPI.reportUserNoShow(bookingId, {
            reason: "User did not show up as scheduled",
          });
          break;
      }
      loadBookings();
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      alert("ไม่สามารถดำเนินการได้");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter.status && booking.Status !== filter.status) return false;
    if (filter.paymentStatus && booking.PaymentStatus !== filter.paymentStatus)
      return false;
    return true;
  });

  if (authLoading || loading) {
    return <Loading text="กำลังโหลดข้อมูลการจอง..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">การจองทั้งหมด</h1>
          <p className="mt-2 text-gray-600">ดูและจัดการการจองทริปของคุณ</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <BookingsFilters filter={filter} onFilterChange={setFilter} />

        {filteredBookings.length === 0 ? (
          <EmptyBookings
            hasBookings={bookings.length > 0}
            userRole={user?.role}
          />
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.ID}
                booking={booking}
                userRole={user?.role}
                onConfirmAction={handleConfirmAction}
              />
            ))}
          </div>
        )}

        {bookings.length > 0 && <BookingsStats bookings={bookings} />}
      </div>
    </div>
  );
}
