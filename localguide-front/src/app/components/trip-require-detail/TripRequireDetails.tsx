import { TripRequire } from "@/app/types";

interface TripRequireDetailsProps {
  tripRequire: TripRequire;
}

export default function TripRequireDetails({
  tripRequire,
}: TripRequireDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Description Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          รายละเอียดความต้องการ
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {tripRequire.Description}
        </p>
      </div>

      {/* Requirements Card */}
      {tripRequire.Requirements && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ความต้องการพิเศษ
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {tripRequire.Requirements}
          </p>
        </div>
      )}
    </div>
  );
}
