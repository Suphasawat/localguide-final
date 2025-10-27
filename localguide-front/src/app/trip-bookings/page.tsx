"use client";

import Navbar from "../components/Navbar";
import MyBookingsHeader from "../components/my-bookings/MyBookingsHeader";
import BookingCard from "../components/my-bookings/BookingCard";
import EmptyBookingsState from "../components/my-bookings/EmptyBookingsState";
import { useMyBookings } from "../components/my-bookings/useMyBookings";

export default function TripBookingsPage() {
  const { bookings, loading, error, payingId, userRole, handlePayFromList } = useMyBookings();

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
      <div className="min-h-screen bg-gray-50 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MyBookingsHeader />

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
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
    </>
  );
}
