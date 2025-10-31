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

    // If booking was reported as user no-show (guide reported), show a special
    // confirmation step after the paid step so both sides see "ยืนยันว่าไม่มา".
    const isUserNoShowReported =
      status === "user_no_show_reported" || status === "no_show_reported";

    // If user (or system) confirmed the no-show already, show confirmed step
    const isUserNoShowConfirmed =
      status === "user_no_show_confirmed" ||
      status === "no_show_confirmed" ||
      status === "guide_no_show_confirmed";

    if (isUserNoShowReported) {
      terminal = "no_show";
      // we'll treat the paid step as completed and append a confirm step below
      currentIndex = TIMELINE_ORDER.indexOf("paid");
    } else if (isUserNoShowConfirmed) {
      terminal = "no_show";
      // treat paid as complete and append the confirmed-no-show step
      currentIndex = TIMELINE_ORDER.indexOf("paid");
    } else if (status === "no_show") {
      terminal = "no_show";
      currentIndex = TIMELINE_ORDER.indexOf("paid");
    } else if (status === "cancelled") {
      terminal = "cancelled";
      // Assume cancellation usually happens before trip started
      currentIndex = Math.max(0, TIMELINE_ORDER.indexOf("pending_payment"));
    }

    if (currentIndex < 0) currentIndex = 0;

    // Build base steps. Use a widened type so we can append custom timeline steps.
    const steps: { key: string; label: string; state: StepState }[] =
      TIMELINE_ORDER.map((key, idx) => {
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
          // For terminal states (cancelled / no_show) we mark steps before currentIndex as complete
          state = idx < currentIndex ? "complete" : "upcoming";
        }

        return { key: String(key), label: getStatusText(String(key)), state };
      });

    // If user no-show was reported, append a confirm step and make paid step complete
    if (isUserNoShowReported) {
      const paidIndex = TIMELINE_ORDER.indexOf("paid");
      // Ensure paid step is marked complete
      if (paidIndex >= 0 && paidIndex < steps.length) {
        steps[paidIndex].state = "complete";
      }
      // Append confirm step as the current step
      steps.push({
        key: "user_no_show_reported",
        label: getStatusText("user_no_show_reported"),
        state: "current",
      });
      return { steps, terminal: "no_show" as const };
    }

    // If no-show was already confirmed, append a confirmed step and mark paid complete
    if (isUserNoShowConfirmed) {
      const paidIndex = TIMELINE_ORDER.indexOf("paid");
      if (paidIndex >= 0 && paidIndex < steps.length) {
        steps[paidIndex].state = "complete";
      }
      // Append the exact confirmed status so label reflects backend status (e.g. user_no_show_confirmed)
      steps.push({
        key: String(status),
        label: getStatusText(String(status)),
        state: "current",
      });
      return { steps, terminal: "no_show" as const };
    }

    return { steps, terminal };
  };

  return { buildTimeline };
};
