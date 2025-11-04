"use client";

interface NotesSectionProps {
  booking: any;
  getSpecialRequests: (booking: any) => string;
  getNotes: (booking: any) => string;
}

export default function NotesSection({
  booking,
  getSpecialRequests,
  getNotes,
}: NotesSectionProps) {
  const specialRequests = getSpecialRequests(booking);
  const notes = getNotes(booking);

  if (!specialRequests && !notes) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">หมายเหตุ</h2>
      {specialRequests && (
        <div className="mb-2">
          <span className="text-sm text-gray-500">ความต้องการพิเศษ:</span>{" "}
          {specialRequests}
        </div>
      )}
      {notes && (
        <div>
          <span className="text-sm text-gray-500">โน้ต:</span> {notes}
        </div>
      )}
    </div>
  );
}
