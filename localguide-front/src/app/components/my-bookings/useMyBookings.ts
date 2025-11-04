import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripBookingAPI } from "../../lib/api";
import type { TripBooking as TripBookingType } from "../../types";

export function useMyBookings() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<TripBookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  const loadBookings = async () => {
    try {
      const response = await tripBookingAPI.getAll();
      const data = response.data;
      const list = Array.isArray(data) ? data : data?.bookings;
      setBookings(list || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handlePayFromList = async (bookingId: number) => {
    try {
      setPayingId(bookingId);
      setError("");
      const resp = await tripBookingAPI.createPayment(bookingId);
      const cs =
        resp.data?.client_secret || resp.data?.payment?.StripeClientSecret;
      const pi =
        resp.data?.payment_intent_id ||
        resp.data?.payment?.StripePaymentIntentID;
      const amount =
        resp.data?.amount ?? resp.data?.payment?.TotalAmount ?? undefined;
      if (!cs || !pi) throw new Error("missing payment param");
      router.push(
        `/trip-bookings/${bookingId}/payment?pi=${encodeURIComponent(
          pi
        )}&cs=${encodeURIComponent(cs)}${
          amount != null ? `&amount=${encodeURIComponent(amount)}` : ""
        }`
      );
    } catch (e) {
      console.error(e);
      setError("ไม่สามารถสร้างการชำระเงินได้");
    } finally {
      setPayingId(null);
    }
  };

  return {
    bookings,
    loading,
    error,
    payingId,
    userRole: user?.role,
    handlePayFromList,
  };
}
