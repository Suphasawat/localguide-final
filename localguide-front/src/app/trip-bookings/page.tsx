"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MyBookingsHeader from "../components/my-bookings/MyBookingsHeader";
import BookingCard from "../components/my-bookings/BookingCard";
import EmptyBookingsState from "../components/my-bookings/EmptyBookingsState";
import { useMyBookings } from "../components/my-bookings/useMyBookings";

export default function TripBookingsPage() {
  const { bookings, loading, error, payingId, userRole, handlePayFromList } =
    useMyBookings();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-8">
          <div className="text-lg">กำลังโหลด...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-10 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MyBookingsHeader />

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <EmptyBookingsState userRole={userRole} />
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.ID || (booking as any).id}
                  booking={booking}
                  userRole={userRole}
                  payingId={payingId}
                  onPayFromList={handlePayFromList}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
