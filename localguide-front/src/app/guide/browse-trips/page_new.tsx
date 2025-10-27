"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BrowseTripsHero from "@/app/components/browse-trips/BrowseTripsHero";
import { BrowseTripsGrid } from "@/app/components/browse-trips/BrowseTripsGrid";
import EmptyBrowseTrips from "@/app/components/browse-trips/EmptyBrowseTrips";
import { useBrowseTrips } from "@/app/components/browse-trips/useBrowseTrips";

export default function BrowseTripsPage() {
  const { items, loading, error, reload } = useBrowseTrips();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] grid place-items-center bg-emerald-50">
          <div className="animate-pulse text-emerald-700 font-semibold">
            กำลังโหลด...
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <BrowseTripsHero onRefresh={reload} />

      <div className="min-h-[60vh] bg-emerald-50/30 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <EmptyBrowseTrips />
          ) : (
            <BrowseTripsGrid items={items} />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
