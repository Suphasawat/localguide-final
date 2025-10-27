import { useState, useEffect } from "react";
import { CreateTripRequireData } from "@/app/types";

export function useTripRequireForm(initialData?: CreateTripRequireData) {
  const [formData, setFormData] = useState<CreateTripRequireData>(
    initialData || {
      province_id: 0,
      title: "",
      description: "",
      min_price: 0,
      max_price: 0,
      start_date: "",
      end_date: "",
      days: 1,
      min_rating: 0,
      group_size: 1,
      requirements: "",
      expires_at: "",
    }
  );

  // Helper: Check if string is valid ISO date (yyyy-mm-dd)
  function isISODate(value: string): boolean {
    if (value.length !== 10) return false;
    if (value[4] !== "-" || value[7] !== "-") return false;

    const y = Number(value.slice(0, 4));
    const m = Number(value.slice(5, 7));
    const d = Number(value.slice(8, 10));

    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return false;
    if (m < 1 || m > 12) return false;

    const dim = new Date(y, m, 0).getDate();
    return d >= 1 && d <= dim;
  }

  // Helper: Create local date object
  function toLocalDate(y: number, m: number, d: number): Date {
    return new Date(y, m - 1, d);
  }

  // Helper: Convert yyyy-mm-dd to dd/mm/yyyy for backend
  function toBackendDate(iso: string): string {
    if (!isISODate(iso)) return iso;
    const y = iso.slice(0, 4);
    const m = iso.slice(5, 7);
    const d = iso.slice(8, 10);
    return `${d}/${m}/${y}`;
  }

  // Helper: Convert backend date to input date (yyyy-mm-dd)
  function toInputDate(val: unknown): string {
    if (!val) return "";

    // Handle dd/mm/yyyy format
    if (typeof val === "string" && val.includes("/")) {
      const [dd, mm, yyyy] = val.split("/");
      if (dd && mm && yyyy) {
        return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(
          2,
          "0"
        )}`;
      }
    }

    // Handle Date object or ISO string
    const d = new Date(val as any);
    if (!Number.isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    return "";
  }

  // Auto-calculate days when date range changes
  useEffect(() => {
    const s = formData.start_date;
    const e = formData.end_date;

    if (!isISODate(s) || !isISODate(e)) return;

    const sy = Number(s.slice(0, 4));
    const sm = Number(s.slice(5, 7));
    const sd = Number(s.slice(8, 10));
    const ey = Number(e.slice(0, 4));
    const em = Number(e.slice(5, 7));
    const ed = Number(e.slice(8, 10));

    const start = toLocalDate(sy, sm, sd);
    const end = toLocalDate(ey, em, ed);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      return;
    }

    const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    setFormData((prev) => (prev.days === days ? prev : { ...prev, days }));
  }, [formData.start_date, formData.end_date]);

  // Handle form field changes
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    const numeric = new Set([
      "province_id",
      "min_price",
      "max_price",
      "group_size",
      "min_rating",
    ]);

    setFormData((prev) => ({
      ...prev,
      [name]: numeric.has(name) ? Number(value) : value,
    }));
  }

  // Validation: Price range
  const isPriceInvalid =
    formData.min_price > 0 &&
    formData.max_price > 0 &&
    formData.min_price >= formData.max_price;

  // Validation: Date range
  const isDateRangeInvalid = (() => {
    const s = formData.start_date;
    const e = formData.end_date;

    if (!isISODate(s) || !isISODate(e)) return false;

    const start = toLocalDate(
      Number(s.slice(0, 4)),
      Number(s.slice(5, 7)),
      Number(s.slice(8, 10))
    );
    const end = toLocalDate(
      Number(e.slice(0, 4)),
      Number(e.slice(5, 7)),
      Number(e.slice(8, 10))
    );

    return (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    );
  })();

  // Validation: Expiration date shouldn't be after start date
  const isExpireAfterStart = (() => {
    const expireISO = formData.expires_at;
    const startISO = formData.start_date;

    if (!expireISO || !isISODate(expireISO) || !isISODate(startISO)) {
      return false;
    }

    const ex = toLocalDate(
      Number(expireISO.slice(0, 4)),
      Number(expireISO.slice(5, 7)),
      Number(expireISO.slice(8, 10))
    );
    const st = toLocalDate(
      Number(startISO.slice(0, 4)),
      Number(startISO.slice(5, 7)),
      Number(startISO.slice(8, 10))
    );

    return ex.getTime() > st.getTime();
  })();

  return {
    formData,
    setFormData,
    handleChange,
    isPriceInvalid,
    isDateRangeInvalid,
    isExpireAfterStart,
    toBackendDate,
    toInputDate,
  };
}
