import Link from "next/link";
import { TripOffer, TripRequire } from "@/app/types";

interface OffersPreviewProps {
  tripRequire: TripRequire;
  offersPreview: TripOffer[];
  getOfferTitle: (offer: any) => string;
  getOfferGuideName: (offer: any) => string;
  getOfferPrice: (offer: any) => number | undefined;
}

export default function OffersPreview({
  tripRequire,
  offersPreview,
  getOfferTitle,
  getOfferGuideName,
  getOfferPrice,
}: OffersPreviewProps) {
  if (offersPreview.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">ข้อเสนอล่าสุด</h3>
        <Link
          href={`/user/trip-requires/${tripRequire.ID}/offers`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ดูทั้งหมด →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {offersPreview.map((o) => (
          <div key={o.ID} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-gray-900 line-clamp-1">
                  {getOfferTitle(o)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  โดย {getOfferGuideName(o)}
                </div>
              </div>
              {getOfferPrice(o) !== undefined && (
                <div className="shrink-0 text-right">
                  <div className="text-xs text-gray-500">ราคาโดยรวม</div>
                  <div className="font-semibold text-gray-900">
                    ฿{getOfferPrice(o)!.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            {o.Description && (
              <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                {o.Description}
              </p>
            )}
            <div className="mt-4">
              <Link
                href={`/user/trip-requires/${tripRequire.ID}/offers`}
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                ดูข้อเสนอนี้
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
