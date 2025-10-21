import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-600 to-emerald-500">
        <div className="mx-auto max-w-6xl px-6 py-16 text-white">
          <h1 className="text-3xl font-extrabold md:text-4xl">
            เกี่ยวกับ Localguide
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            แพลตฟอร์มที่เชื่อมนักเดินท่องเที่ยวกับไกด์ท้องถิ่น เพื่อประสบการณ์ท่องเที่ยวที่จริงใจและเข้าถึงพื้นที่นั้น
            อย่างแท้จริง อีกทั้งยังได้สัมผัสถึงวัฒนธรรมท้องถิ่น อาหารพื้นเมือง และสาวสวยสุดน่ารัก
          </p>
        </div>
      </div>
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12 grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-gray-900">เราเชื่อในการท่องเที่ยวที่จริงใจ</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Localguide ช่วยให้คุณค้นหาและจองไกด์ท้องถิ่นได้ง่ายขึ้น
              ทั้งการเดินทางเชิงวัฒนธรรม ธรรมชาติ อาหาร หรือกิจกรรมพิเศษในพื้นที่
              เราตั้งใจทำให้ทุกทริปมีความหมายกับผู้เดินทาง และสร้างรายได้อย่างยั่งยืนให้กับคนในชุมชน
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">วิสัยทัศน์</h3>
                <p className="mt-2 text-gray-700">
                  สร้างระบบนิเวศการท่องเที่ยวที่ทุกฝ่ายได้ประโยชน์:
                  นักเดินทางได้ประสบการณ์จริง ไกด์มีรายได้ยุติธรรม และชุมชนเติบโตอย่างยั่งยืน
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">สิ่งที่เราทำ</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                  <li>เชื่อมต่อผู้ใช้กับไกด์ท้องถิ่นที่ผ่านการยืนยัน</li>
                  <li>ระบบข้อเสนอราคา/การจองที่โปร่งใส</li>
                  <li>สนับสนุนคอนเทนต์ท้องถิ่นและการท่องเที่ยวรับผิดชอบ</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="h-fit rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900">ติดต่อเรา</h2>
            <div className="mt-4 space-y-4 text-gray-700">
              <div>
                <div className="text-sm text-gray-500">ที่อยู่</div>
                <p className="mt-1">
                  Kamphaeng Saen, Kamphaeng Saen District,<br />
                  Nakhon Pathom 73140
                </p>
              </div>
              <div>
                <div className="text-sm text-gray-500">ติดต่อแอดมิน</div>
                <p className="mt-1">
                  โทร:{" "}
                  <Link
                    href="tel:0956167560"
                    className="font-semibold text-emerald-700 hover:text-emerald-600"
                  >
                    095-616-xxxx
                  </Link>
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
                >
                  โทรหาเรา
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
