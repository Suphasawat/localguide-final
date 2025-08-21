"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { tripBookingAPI } from "../../../lib/api";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";

function PaymentForm({
  bookingId,
  paymentIntentId,
  onConfirmed,
  onAwaiting,
}: {
  bookingId: string;
  paymentIntentId: string;
  onConfirmed: () => void;
  onAwaiting: () => void; // for PromptPay waiting state
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError("");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:
          typeof window !== "undefined" ? window.location.href : undefined,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "การชำระเงินล้มเหลว กรุณาลองใหม่");
      setSubmitting(false);
      return;
    }

    // Try to finalize immediately (card payments should succeed here)
    try {
      await tripBookingAPI.confirmPayment(Number(bookingId), {
        payment_intent_id: paymentIntentId,
      });
      onConfirmed();
    } catch (_) {
      // Likely PromptPay pending; inform parent to start polling
      onAwaiting();
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "กำลังประมวลผล..." : "ชำระเงิน"}
      </button>
    </form>
  );
}

export default function TripBookingPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const bookingId = params.id as string;

  // From query params (if present)
  const qsPI = useMemo(() => searchParams.get("pi") || "", [searchParams]);
  const qsCS = useMemo(() => searchParams.get("cs") || "", [searchParams]);
  const qsAmount = useMemo(
    () => searchParams.get("amount") || "",
    [searchParams]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState<string>(qsCS);
  const [paymentIntentId, setPaymentIntentId] = useState<string>(qsPI);
  const [amount, setAmount] = useState<number | null>(
    qsAmount ? Number(qsAmount) : null
  );
  const [bookingTitle, setBookingTitle] = useState<string>("");
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [awaitingPromptPay, setAwaitingPromptPay] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!bookingId) {
      router.push("/trip-bookings");
      return;
    }

    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as
      | string
      | undefined;
    if (pk) {
      setStripePromise(loadStripe(pk));
    }

    // Try to load booking info for context
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Always fetch booking to show context
        const br = await tripBookingAPI.getById(Number(bookingId));
        const b = br.data?.booking ?? br.data ?? null;
        const getTitle = (x: any) =>
          x?.TripOffer?.Title ||
          x?.trip_title ||
          x?.TripTitle ||
          `การจอง #${x?.ID ?? x?.id ?? bookingId}`;
        setBookingTitle(b ? getTitle(b) : `การจอง #${bookingId}`);

        // If missing parameters from query, fetch payment info
        if (!qsPI || !qsCS || !qsAmount) {
          try {
            const pr = await tripBookingAPI.getPayment(Number(bookingId));
            const p = pr.data?.payment ?? pr.data ?? {};
            // Safe getters for mixed shapes
            const cs =
              p?.StripeClientSecret ??
              p?.stripe_client_secret ??
              p?.client_secret;
            const pi =
              p?.StripePaymentIntentID ??
              p?.stripe_payment_intent_id ??
              p?.payment_intent_id;
            const amt = p?.TotalAmount ?? p?.total_amount ?? amount;
            if (cs) setClientSecret(cs);
            if (pi) setPaymentIntentId(pi);
            if (amt != null) setAmount(Number(amt));
          } catch (e) {
            // Ignore if no payment yet; user should go back and start payment from booking page
          }
        }
      } catch (e) {
        console.error(e);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, bookingId]);

  // Poll payment status after PromptPay confirmation request
  useEffect(() => {
    if (!awaitingPromptPay || !paymentIntentId) return;
    let cancelled = false;
    let tries = 0;
    const maxTries = 40; // ~2 minutes at 3s interval

    const tick = async () => {
      if (cancelled || tries >= maxTries) return;
      tries += 1;
      try {
        // Try server-side confirmation first
        await tripBookingAPI.confirmPayment(Number(bookingId), {
          payment_intent_id: paymentIntentId,
        });
        if (!cancelled) router.replace(`/trip-bookings/${bookingId}`);
        return;
      } catch (_) {
        // Fallback to checking payment record
        try {
          const pr = await tripBookingAPI.getPayment(Number(bookingId));
          const p = pr.data?.payment ?? pr.data ?? {};
          const status = p?.Status ?? p?.status ?? "";
          if (status === "paid") {
            if (!cancelled) router.replace(`/trip-bookings/${bookingId}`);
            return;
          }
        } catch (_) {}
      }
      // schedule next check
      setTimeout(tick, 3000);
    };

    tick();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitingPromptPay, paymentIntentId]);

  const isReady = !!paymentIntentId && !!clientSecret;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← กลับ
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">ชำระเงิน</h1>
        <p className="text-gray-600 mb-6">{bookingTitle}</p>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">ยอดเรียกเก็บ</div>
            <div className="text-xl font-semibold">฿{amount ?? "-"}</div>
          </div>

          {!isReady && (
            <div className="text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded">
              ไม่พบข้อมูลการชำระเงิน โปรดกลับไปที่หน้ารายละเอียดการจอง
              แล้วกดปุ่ม "ชำระเงิน" อีกครั้ง
            </div>
          )}

          {isReady && stripePromise ? (
            <Elements options={{ clientSecret }} stripe={stripePromise}>
              <PaymentForm
                bookingId={bookingId}
                paymentIntentId={paymentIntentId}
                onConfirmed={() =>
                  router.replace(`/trip-bookings/${bookingId}`)
                }
                onAwaiting={() => setAwaitingPromptPay(true)}
              />
            </Elements>
          ) : (
            isReady && (
              <div className="text-sm text-gray-600">
                ไม่พบคีย์ Stripe publishable key. โปรดตั้งค่า
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY แล้วลองใหม่
              </div>
            )
          )}

          {awaitingPromptPay && (
            <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 p-3 rounded">
              ได้สร้างคำขอชำระเงิน PromptPay แล้ว โปรดสแกน QR
              โค้ดในหน้าต่างชำระเงินของ Stripe และรอระบบยืนยันอัตโนมัติ...
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => router.push(`/trip-bookings/${bookingId}`)}
              className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
