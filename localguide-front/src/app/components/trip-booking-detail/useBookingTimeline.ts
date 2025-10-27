type StepState = "complete" | "current" | "upcoming";

const TIMELINE_ORDER = [
  "pending_payment",
  "paid",
  "trip_started",
  "trip_completed",
] as const;

export const useBookingTimeline = (
  getStatusText: (status: string) => string
) => {
  const buildTimeline = (status: string) => {
    let terminal: "cancelled" | "no_show" | undefined;
    let currentIndex = TIMELINE_ORDER.indexOf(status as any);

    if (status === "no_show") {
      terminal = "no_show";
      currentIndex = TIMELINE_ORDER.indexOf("paid");
    } else if (status === "cancelled") {
      terminal = "cancelled";
      // Assume cancellation usually happens before trip started
      currentIndex = Math.max(0, TIMELINE_ORDER.indexOf("pending_payment"));
    }

    if (currentIndex < 0) currentIndex = 0;

    const steps = TIMELINE_ORDER.map((key, idx) => {
      let state: StepState = "upcoming";
      if (status === "trip_completed") {
        state = idx < TIMELINE_ORDER.length - 1 ? "complete" : "current";
      } else if (!terminal) {
        state =
          idx < currentIndex
            ? "complete"
            : idx === currentIndex
            ? "current"
            : "upcoming";
      } else {
        state = idx < currentIndex ? "complete" : "upcoming";
      }
      return { key, label: getStatusText(key), state };
    });

    return { steps, terminal };
  };

  return { buildTimeline };
};
