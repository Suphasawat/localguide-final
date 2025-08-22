// Auth Types
export interface User {
  id: number;
  email: string;
  role: number;
  FirstName?: string;
  LastName?: string;
  Phone?: string;
  Nationality?: string;
  Sex?: string;
  Avatar?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

// Province Types
export interface Province {
  ID: number;
  Name: string;
  Region: string;
}

export interface TouristAttraction {
  ID: number;
  Name: string;
  Description: string;
  ProvinceID: number;
  District: string;
  City: string;
  Category: string;
  Rating: number;
  ImageURL?: string;
}

// Guide Types
export interface Guide {
  ID: number;
  UserID: number;
  Bio: string;
  Description: string;
  Available: boolean;
  Price: number;
  Rating: number;
  ProvinceID: number;
  User: User;
}

export interface CreateGuideData {
  Bio: string;
  Description: string;
  Price: number;
  ProvinceID: number;
}

// TripRequire Types
export interface TripRequire {
  ID: number;
  UserID: number;
  ProvinceID: number;
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string;
  EndDate: string;
  Days: number;
  MinRating: number;
  GroupSize: number;
  Requirements?: string;
  Status: string;
  PostedAt: string;
  ExpiresAt?: string;
  Province?: Province;
  User?: User;
  total_offers?: number;
  province_name?: string;
}

export interface CreateTripRequireData {
  province_id: number;
  title: string;
  description: string;
  min_price: number;
  max_price: number;
  start_date: string;
  end_date: string;
  days: number;
  min_rating: number;
  group_size: number;
  requirements: string;
  expires_at: string;
}

// TripOffer Types
export interface TripOffer {
  ID: number;
  TripRequireID: number;
  GuideID: number;
  Title: string;
  Description: string;
  Itinerary: string;
  IncludedServices: string;
  ExcludedServices: string;
  Status: string;
  OfferNotes?: string;
  SentAt?: string;
  AcceptedAt?: string;
  RejectedAt?: string;
  RejectionReason?: string;
  Guide?: Guide;
  TripRequire?: TripRequire;
  Quotation?: TripOfferQuotation;
  TripOfferQuotation?: TripOfferQuotation[];
}

export interface TripOfferQuotation {
  ID: number;
  TripOfferID: number;
  Version: number;
  TotalPrice: number;
  PriceBreakdown: string;
  Terms: string;
  PaymentTerms: string;
  QuotationNumber?: string;
  ValidUntil: string;
  Status: string;
  SentAt?: string;
  AcceptedAt?: string;
  RejectedAt?: string;
  Notes?: string;
}

export interface CreateTripOfferData {
  TripRequireID: number;
  Title: string;
  Description: string;
  Itinerary: string;
  IncludedServices: string;
  ExcludedServices: string;
  TotalPrice: number;
  PriceBreakdown: string;
  Terms: string;
  PaymentTerms: string;
  OfferNotes?: string;
  ValidDays: number;
}

// TripBooking Types
export interface TripBooking {
  // Backend properties (snake_case)
  id: number;
  trip_offer_id: number;
  user_id: number;
  guide_id: number;
  start_date: string;
  total_amount: number;
  status: string;
  payment_status: string;
  trip_started_at?: string;
  trip_completed_at?: string;
  cancelled_at?: string;
  no_show_at?: string;
  cancellation_reason?: string;
  special_requests?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Flattened properties from backend response
  province_name?: string;
  trip_title?: string;
  trip_require_title?: string;
  user_name?: string;
  guide_name?: string;

  // Legacy/Alternative properties (PascalCase) for backward compatibility
  ID: number; // Make this required as fallback
  TripOfferID?: number;
  UserID?: number;
  GuideID?: number;
  StartDate: string; // Make this required as fallback
  TotalAmount: number; // Make this required as fallback
  Status?: string;
  PaymentStatus?: string;
  TripStartedAt?: string;
  TripCompletedAt?: string;
  CancelledAt?: string;
  NoShowAt?: string;
  CancellationReason?: string;
  SpecialRequests?: string;
  Notes?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  ProvinceName?: string;
  TripTitle?: string;
  UserName?: string;
  GuideName?: string;

  // Related objects (might not be populated in list responses)
  Payment?: TripPayment;
  PaymentReleases?: PaymentRelease[];
  TripOffer?: TripOffer;
  User?: User;
  Guide?: Guide;
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
  StripePaymentIntentID?: string;
  StripeClientSecret?: string;
  StripeStatus?: string;
  Status: string;
  PaidAt?: string;
  FirstReleasedAt?: string;
  SecondReleasedAt?: string;
  RefundedAt?: string;
  RefundAmount: number;
  RefundReason?: string;
  Notes?: string;
}

export interface PaymentRelease {
  ID: number;
  TripPaymentID: number;
  ReleaseType: string;
  Amount: number;
  RecipientType: string;
  RecipientID: number;
  Reason: string;
  ScheduledAt: string;
  ProcessedAt?: string;
  Status: string;
  TransactionRef?: string;
  Notes?: string;
}

// API Response Types
export interface ApiResponse<T> {
  Success?: boolean;
  Data?: T;
  Message?: string;
  Error?: string;
  Details?: string;
}

export interface LoginResponse {
  Token: string;
  User: User;
}

export interface PaginatedResponse<T> {
  Data: T[];
  Total: number;
  Page?: number;
  Limit?: number;
}

export interface GuideVerification {
  ID: number;
  Status: string;
  VerificationDate: string;
  Bio: string;
  Description: string;
  Price: number;
  ProvinceID: number;
  Province: {
    ID: number;
    Name: string;
    Region: string;
  };
  User: {
    FirstName: string;
    LastName: string;
    Email: string;
  };
}

export interface TripReport {
  ID: number;
  ReportType: string;
  Title: string;
  Description: string;
  Severity: string;
  Status: string;
  Reporter: {
    FirstName: string;
    LastName: string;
  };
  ReportedUser: {
    FirstName: string;
    LastName: string;
  };
}
