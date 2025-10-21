import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Praknorth from "./components/Praknorth";
import Jangwadrong from "./components/Jangwadrong";
import Recommendations from "./components/Recommendations";
import Footer from "./components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen w-full overflow-hidden bg-black">
        <Image
          src="/home/bg.jpg"
          alt="ภูเขาและหุบเขาในประเทศไทย"
          fill
          priority
          className="object-cover opacity-90"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* เนื้อหา */}
        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16 md:px-15">
          <div className="max-w-xl text-white">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Find your next travel
              <br />
              experience
            </h1>

            <div className="mt-5 text-white/90 md:text-lg">
              เปิดประสบการณ์ใหม่ ทั้งสถานที่ กิจกรรมที่น่าสนใจ และวัฒนธรรม
            </div>

            {/* ปุ่ม CTA */}
            <div className="mt-8 flex items-center gap-7 md:gap-2">
              {/* ปุ่มหลัก: โพสต์หาไกด์ท้องถิ่น */}
              <Link
                href="/dashboard"
                className="inline-block rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                โพสต์หาไกด์ท้องถิ่น
              </Link>

              <Link
                href="/step-guide"
                className="inline-block rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                สมัครเป็นไกด์
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Praknorth />
      <Jangwadrong />
      <Recommendations />
      <Footer />
    </>
  );
}
