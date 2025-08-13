// Auth Types
export interface User {
  ID: number;
  Email: string;
  FirstName: string;
  LastName: string;
  Phone: string;
  Nationality: string;
  Sex: string;
  Avatar?: string;
  Role: {
    ID: number;
    Name: string;
  };
}

export interface LoginData {
  Email: string;
  Password: string;
}

export interface RegisterData {
  Email: string;
  Password: string;
  FirstName: string;
  LastName: string;
  Phone: string;
  Nationality: string;
  Sex: string;
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
  OffersCount?: number;
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
  ID: number;
  TripOfferID: number;
  UserID: number;
  GuideID: number;
  StartDate: string;
  TotalAmount: number;
  Status: string;
  PaymentStatus: string;
  TripStartedAt?: string;
  TripCompletedAt?: string;
  CancelledAt?: string;
  NoShowAt?: string;
  CancellationReason?: string;
  SpecialRequests?: string;
  Notes?: string;
  CreatedAt: string;
  UpdatedAt: string;
  ProvinceName?: string;
  TripTitle?: string;
  UserName?: string;
  GuideName?: string;
  Payment?: TripPayment;
  PaymentReleases?: PaymentRelease[];
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
