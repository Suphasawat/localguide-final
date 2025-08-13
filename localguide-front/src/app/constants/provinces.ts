export const PROVINCES = ["กรุงเทพมหานคร", "ขอนแก่น", "เชียงใหม่"] as const;

export type Province = (typeof PROVINCES)[number];
