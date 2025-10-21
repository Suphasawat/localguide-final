import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BecomeGuidePage() {
  return (
    <>
      <Navbar />
      <div className="relative w-full h-[300px] md:h-[380px] flex items-center justify-center text-center text-white overflow-hidden">
        <Image
          src="/guide/bg.jpg" // << ใช้รูปของคุณเอง
          alt="ภูเขาและบรรยากาศธรรมชาติ"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative px-4">
          <h1 className="text-2xl md:text-4xl font-bold drop-shadow">
            สมัครเป็นไกด์ท้องถิ่นกับ Localguide
          </h1>
          <Link
            href="/become-guide"
            className="mt-6 inline-block rounded-full bg-blue-700 px-6 py-3 text-white font-semibold transition hover:bg-blue-600"
          >
            สมัครเป็นไกด์
          </Link>
        </div>
      </div>
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-2xl md:text-3xl font-extrabold text-blue-800 mb-12">
            4 ขั้นตอนการสมัครเป็นไกด์ท้องถิ่นกับ Localguide
          </h2>
          <div className="flex gap-6 mb-12 items-start">
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image
                src="/guide/card.jpg"
                alt="สมัครเป็นไกด์"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-blue-800">
                สมัครเป็นไกด์
              </h3>
              <p className="text-gray-700 leading-relaxed">
                ลงทะเบียนพร้อมเตรียมบัตรประชาชนและบัตรมัคคุเทศก์ให้พร้อมสำหรับการสมัคร
                จากนั้นรอการอนุมัติจากทีมงาน
              </p>
            </div>
          </div>
          <div className="flex gap-6 mb-12 items-start">
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image
                src="/guide/prices.jpg"
                alt="เสนอราคา"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-blue-800">
                เสนอราคาการนำเที่ยว
              </h3>
              <p className="text-gray-700 leading-relaxed">
                เสนอราคาการนำเที่ยวให้ลูกค้าในแต่ละครั้ง
                จากรายละเอียดความต้องการของลูกค้า และรอการตอบรับผ่านระบบ
              </p>
            </div>
          </div>
          <div className="flex gap-6 mb-12 items-start">
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image
                src="/guide/offer.jpg"
                alt="รอรับการตอบรับ"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-blue-800">
                รอรับการตอบรับจากลูกค้า
              </h3>
              <p className="text-gray-700 leading-relaxed">
                เมื่อลูกค้าตอบรับข้อเสนอของคุณ
                ระบบจะแจ้งเตือนและคุณสามารถเริ่มเตรียมการนำเที่ยวได้ทันที
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image
                src="/guide/nice.jpg"
                alt="เริ่มงาน"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-blue-800">
                เริ่มงานได้เลย
              </h3>
              <p className="text-gray-700 leading-relaxed">
                เมื่อได้รับการตอบรับเรียบร้อยแล้ว
                “เริ่มต้นการเป็นไกด์ท้องถิ่นของคุณ” และสร้างรายได้ในทริปแรก
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
