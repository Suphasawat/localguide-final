import axios from "axios";
import { getCookie } from "cookies-next";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api`;

export interface TripRequire {
  ID: number;
  UserID: number;
  ProvinceID: number;
  Province: {
    ID: number;
    Name: string;
    Region: string;
  };
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string;
  EndDate: string;
  Days: number;
  MinRating: number;
  GroupSize: number;
  Requirements: string;
  Status: string; // open, in_review, assigned, completed, cancelled
  PostedAt: string;
  ExpiresAt?: string;
  TouristAttractions?: TouristAttraction[];
  TripOffers?: TripOffer[];
  SelectedOfferID?: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface TripOffer {
  ID: number;
  TripRequireID: number;
  GuideID: number;
  Guide: {
    ID: number;
    User: {
      ID: number;
      FirstName: string;
      LastName: string;
      Nickname?: string;
      Avatar?: string;
    };
    Bio: string;
    Description: string;
    Price: number;
    Rating: number;
    ProvinceRef: {
      Name: string;
    };
  };
  Title: string;
  Description: string;
  Itinerary: string; // JSON string
  IncludedServices: string; // JSON string
  ExcludedServices: string; // JSON string
  TotalPrice: number;
  PriceBreakdown: string; // JSON string
  Terms: string; // JSON string
  PaymentTerms: string; // JSON string
  QuotationNumber?: string;
  Version: number;
  IsCounterOffer: boolean;
  ParentOfferID?: number;
  NegotiationNotes: string; // JSON string
  LastModifiedBy: string;
  ModificationReason?: string;
  OfferValidUntil: string;
  Status: string; // pending, negotiating, accepted, rejected, expired, withdrawn
  OfferNotes?: string;
  AcceptedAt?: string;
  RejectedAt?: string;
  RejectionReason?: string;
  PaymentDeadline?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface TripBooking {
  ID: number;
  TripOfferID: number;
  TripOffer: TripOffer;
  UserID: number;
  User: {
    ID: number;
    FirstName: string;
    LastName: string;
    Avatar?: string;
  };
  GuideID: number;
  Guide: {
    ID: number;
    User: {
      ID: number;
      FirstName: string;
      LastName: string;
      Avatar?: string;
    };
  };
  StartDate: string;
  TotalAmount: number;
  Status: string; // pending_payment, paid, trip_started, trip_completed, cancelled, no_show_reported, no_show_disputed, no_show_confirmed, no_show_split
  PaymentStatus: string; // pending, paid, first_released, fully_released, partially_refunded
  TripStartedAt?: string;
  TripCompletedAt?: string;
  CancelledAt?: string;
  NoShowAt?: string;
  UserConfirmedNoShow: boolean;
  CancellationReason?: string;
  SpecialRequests?: string;
  Notes?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface TripPayment {
  ID: number;
  TripBookingID: number;
  PaymentNumber: string;
  TotalAmount: number;
  FirstPayment: number;
  SecondPayment: number;
  PaymentMethod: string;
  TransactionID: string;
  StripePaymentIntentID: string;
  StripeClientSecret: string;
  StripeStatus: string;
  Status: string; // pending, paid, first_released, fully_released, partially_refunded, refunded
  PaidAt?: string;
  FirstReleasedAt?: string;
  SecondReleasedAt?: string;
  RefundedAt?: string;
  RefundAmount: number;
  RefundReason?: string;
  Notes?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface TouristAttraction {
  ID: number;
  Name: string;
  Description: string;
  Category: string;
  Rating: number;
  ImageURL?: string;
}

export interface CreateTripRequireData {
  provinceID: number;
  title: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  startDate: string;
  endDate: string;
  groupSize: number;
  minRating?: number;
  requirements?: string;
  touristAttractionIDs?: number[];
}

export interface CreateTripOfferData {
  tripRequireID: number;
  title: string;
  description: string;
  itinerary: object;
  includedServices: string[];
  excludedServices: string[];
  totalPrice: number;
  priceBreakdown: object;
  terms: string[];
  paymentTerms: object;
  offerValidUntil: string;
  offerNotes?: string;
}

const createAxiosInstance = () => {
  const token = getCookie("token") as string;
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const tripService = {
  // Trip Require APIs
  async createTripRequire(data: CreateTripRequireData): Promise<TripRequire> {
    const api = createAxiosInstance();
    try {
      const response = await api.post("/trip-requires", data);
      return response.data.trip_require;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการสร้างโพสต์ต้องการไกด์");
    }
  },

  async getTripRequires(): Promise<TripRequire[]> {
    const api = createAxiosInstance();
    try {
      const response = await api.get("/trip-requires");
      return Array.isArray(response.data.trip_requires)
        ? response.data.trip_requires
        : [];
    } catch (error: any) {
      console.error("Error fetching trip requires:", error);
      return [];
    }
  },

  async getTripRequire(id: number): Promise<TripRequire> {
    const api = createAxiosInstance();
    try {
      const response = await api.get(`/trip-requires/${id}`);
      return response.data.trip_require;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
  },

  async getMyTripRequires(): Promise<TripRequire[]> {
    const api = createAxiosInstance();
    try {
      const response = await api.get("/trip-requires/my");
      return Array.isArray(response.data.trip_requires)
        ? response.data.trip_requires
        : [];
    } catch (error: any) {
      console.error("Error fetching my trip requires:", error);
      return [];
    }
  },

  // Trip Offer APIs
  async createTripOffer(data: CreateTripOfferData): Promise<TripOffer> {
    const api = createAxiosInstance();
    try {
      const response = await api.post("/trip-offers", data);
      return response.data.trip_offer;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการสร้างข้อเสนอ");
    }
  },

  async getTripOffers(tripRequireID: number): Promise<TripOffer[]> {
    const api = createAxiosInstance();
    try {
      const response = await api.get(
        `/trip-offers?trip_require_id=${tripRequireID}`
      );
      return Array.isArray(response.data.trip_offers)
        ? response.data.trip_offers
        : [];
    } catch (error: any) {
      console.error("Error fetching trip offers:", error);
      return [];
    }
  },

  async acceptTripOffer(
    offerID: number
  ): Promise<{ trip_booking: TripBooking }> {
    const api = createAxiosInstance();
    try {
      const response = await api.post(`/trip-offers/${offerID}/accept`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการยอมรับข้อเสนอ");
    }
  },

  async rejectTripOffer(offerID: number, reason: string): Promise<void> {
    const api = createAxiosInstance();
    try {
      await api.post(`/trip-offers/${offerID}/reject`, { reason });
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการปฏิเสธข้อเสนอ");
    }
  },

  // Trip Booking APIs
  async getTripBookings(): Promise<TripBooking[]> {
    const api = createAxiosInstance();
    try {
      const response = await api.get("/trip-bookings");
      return Array.isArray(response.data.bookings)
        ? response.data.bookings
        : [];
    } catch (error: any) {
      console.error("Error fetching trip bookings:", error);
      return [];
    }
  },

  async getTripBooking(id: number): Promise<TripBooking> {
    const api = createAxiosInstance();
    try {
      const response = await api.get(`/trip-bookings/${id}`);
      return response.data.booking;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
  },

  // Payment APIs
  async createTripPayment(
    bookingID: number
  ): Promise<{
    payment: TripPayment;
    client_secret: string;
    payment_intent_id: string;
  }> {
    const api = createAxiosInstance();
    try {
      const response = await api.post(`/trip-bookings/${bookingID}/payment`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการสร้างการชำระเงิน");
    }
  },

  async confirmTripPayment(
    bookingID: number,
    paymentIntentID: string
  ): Promise<{ payment: TripPayment; booking: TripBooking }> {
    const api = createAxiosInstance();
    try {
      const response = await api.post(
        `/trip-bookings/${bookingID}/confirm-payment`,
        {
          payment_intent_id: paymentIntentID,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการยืนยันการชำระเงิน");
    }
  },

  // Trip Flow APIs
  async confirmGuideArrival(
    bookingID: number
  ): Promise<{ booking: TripBooking }> {
    const api = createAxiosInstance();
    try {
      const response = await api.post(
        `/trip-bookings/${bookingID}/confirm-arrival`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการยืนยันไกด์มาแล้ว");
    }
  },

  async confirmTripComplete(
    bookingID: number
  ): Promise<{ booking: TripBooking }> {
    const api = createAxiosInstance();
    try {
      const response = await api.post(
        `/trip-bookings/${bookingID}/confirm-complete`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการยืนยันการเสร็จสิ้นทริป");
    }
  },

  async confirmUserNoShow(
    bookingID: number
  ): Promise<{ booking: TripBooking }> {
    const api = createAxiosInstance();
    try {
      const response = await api.post(
        `/trip-bookings/${bookingID}/confirm-no-show`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการยืนยันว่าไม่ได้ไป");
    }
  },

  async reportUserNoShow(bookingID: number): Promise<{ booking: TripBooking }> {
    const api = createAxiosInstance();
    try {
      const response = await api.post(
        `/trip-bookings/${bookingID}/report-no-show`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการรีพอร์ต no-show");
    }
  },

  async disputeNoShowReport(
    bookingID: number,
    data: { reason: string; description: string; evidence?: string }
  ): Promise<{ booking: TripBooking }> {
    const api = createAxiosInstance();
    try {
      const response = await api.post(
        `/trip-bookings/${bookingID}/dispute-no-show`,
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("เกิดข้อผิดพลาดในการคัดค้านการรีพอร์ต");
    }
  },
};
