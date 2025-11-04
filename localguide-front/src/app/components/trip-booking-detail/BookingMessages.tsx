interface BookingMessagesProps {
  error?: string;
  infoMessage?: string;
}

export default function BookingMessages({
  error,
  infoMessage,
}: BookingMessagesProps) {
  if (!error && !infoMessage) return null;

  return (
    <>
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {infoMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded">
          {infoMessage}
        </div>
      )}
    </>
  );
}
