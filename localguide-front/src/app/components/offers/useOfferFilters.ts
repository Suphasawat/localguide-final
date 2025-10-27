import { TripOffer } from "@/app/types";

type StatusFilter =
  | "all"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "withdrawn";
type SortBy = "latest" | "price_low" | "price_high" | "rating_high";

export const useOfferFilters = (
  offers: TripOffer[],
  statusFilter: StatusFilter,
  sortBy: SortBy,
  getOfferPrice: (o: any) => number | null,
  getGuideRating: (o: any) => number | null
) => {
  const counts = {
    sent: offers.filter((o) => o.Status === "sent").length,
    accepted: offers.filter((o) => o.Status === "accepted").length,
    rejected: offers.filter((o) => o.Status === "rejected").length,
    expired: offers.filter((o) => o.Status === "expired").length,
    withdrawn: offers.filter((o) => o.Status === "withdrawn").length,
  };

  const filtered =
    statusFilter === "all"
      ? offers
      : offers.filter((o) => o.Status === statusFilter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price_low" || sortBy === "price_high") {
      const pa = getOfferPrice(a) ?? Number.POSITIVE_INFINITY;
      const pb = getOfferPrice(b) ?? Number.POSITIVE_INFINITY;
      return sortBy === "price_low" ? pa - pb : pb - pa;
    }
    if (sortBy === "rating_high") {
      const ra = getGuideRating(a) ?? -1;
      const rb = getGuideRating(b) ?? -1;
      return rb - ra;
    }
    return (
      new Date(b.SentAt || 0).getTime() - new Date(a.SentAt || 0).getTime()
    );
  });

  const hasAccepted = counts.accepted > 0;

  return {
    counts,
    filtered,
    sorted,
    hasAccepted,
  };
};
