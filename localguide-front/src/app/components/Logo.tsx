"use client";

import Link from "next/link";

export default function GlobalBrand(){
  return (
    <Link
      href="/"
      className="fixed left-4 top-4 z-[60] rounded-full border border-black/10 bg-white/90 px-4 py-2 text-sm md:text-base font-extrabold tracking-tight text-gray-900 shadow-sm backdrop-blur hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
    >
      Localguide
    </Link>
  );
}
