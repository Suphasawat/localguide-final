import { TripRequire } from "./useBrowseTrips";
import TripRequireCardForGuide from "./TripRequireCardForGuide";

interface BrowseTripsGridProps {
  items: TripRequire[];
}

export function BrowseTripsGrid({ items }: BrowseTripsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((trip) => (
        <TripRequireCardForGuide key={trip.ID} trip={trip} />
      ))}
    </div>
  );
}
