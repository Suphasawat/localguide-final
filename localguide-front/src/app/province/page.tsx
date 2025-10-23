// app/provinces/north/page.tsx
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function Province() {
  return (
    <>
      <Navbar />

      {/* HERO: แถบสีเขียวพื้นเดียว ขนาดพอดี */}
      <section className="w-full bg-emerald-500 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            จังหวัดรองของภาคเหนือ
          </h1>
          <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed">
            จังหวัดรองของภาคเหนือทั้ง 16 แห่ง เต็มไปด้วยเสน่ห์ของธรรมชาติ
            วัฒนธรรม และวิถีชีวิตท้องถิ่นที่เรียบง่ายไม่เหมือนใคร
            เหมาะสำหรับผู้ที่อยากสัมผัสกลิ่นอายล้านนาแท้ ๆ
            พร้อมค้นพบความงดงามที่ซ่อนอยู่ในแต่ละเมืองเล็กอย่างอบอุ่นและน่าประทับใจ
          </p>

          <div className="mt-6">
            <Link
              href="/user/trip-requires/create"
              className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              โพสต์หาไกด์ท้องถิ่น
            </Link>
          </div>
        </div>
      </section>

      {/* GRID จังหวัดรอง (Static ทั้งหมด ไม่มี map) */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* เชียงราย */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/chiang-rai.jpg"
                  alt="เชียงราย (Chiang Rai)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  เชียงราย (Chiang Rai)
                </h3>
                <p className="mt-2 text-gray-700">
                  เหนือสุดแดนสยาม วิวภูเขา ชุมชนชาวเขา วัดและศิลปะร่วมสมัย
                </p>
              </div>
            </article>

            {/* พิษณุโลก */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/phitsanilok.jpg"
                  alt="พิษณุโลก (Phitsanulok)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  พิษณุโลก (Phitsanulok)
                </h3>
                <p className="mt-2 text-gray-700">
                  เมืองประวัติศาสตร์ ริมแม่น้ำน่าน ใกล้อุทยานธรรมชาติใหญ่
                </p>
              </div>
            </article>

            {/* ตาก */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/tak.jpg"
                  alt="ตาก (Tak)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">ตาก (Tak)</h3>
                <p className="mt-2 text-gray-700">
                  ภูเขา น้ำตก สายลมหนาว วิวงามตามแนวชายแดน
                </p>
              </div>
            </article>

            {/* เพชรบูรณ์ */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/phetchabun-wadphakech.jpg"
                  alt="เพชรบูรณ์ (Phetchabun)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  เพชรบูรณ์ (Phetchabun)
                </h3>
                <p className="mt-2 text-gray-700">
                  เขาค้อ-ภูทับเบิก ทะเลหมอก ผักผลไม้เมืองหนาว
                </p>
              </div>
            </article>

            {/* นครสวรรค์ */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/nakhon-sawan.jpg"
                  alt="นครสวรรค์ (Nakhon Sawan)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  นครสวรรค์ (Nakhon Sawan)
                </h3>
                <p className="mt-2 text-gray-700">
                  ปากน้ำโพ เมืองประตูสู่เหนือ งานเทศกาลคึกคัก
                </p>
              </div>
            </article>

            {/* สุโขทัย */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/sukothai.jpg"
                  alt="สุโขทัย (Sukhothai)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  สุโขทัย (Sukhothai)
                </h3>
                <p className="mt-2 text-gray-700">
                  อุทยานประวัติศาสตร์มรดกโลก ประเพณีสวยงาม
                </p>
              </div>
            </article>

            {/* ลำพูน */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/lamphun.jpg"
                  alt="ลำพูน (Lamphun)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  ลำพูน (Lamphun)
                </h3>
                <p className="mt-2 text-gray-700">
                  เมืองเก่า วัดพระธาตุหริภุญชัย และประเพณีท้องถิ่น
                </p>
              </div>
            </article>

            {/* อุตรดิตถ์ */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/uttaradit.jpg"
                  alt="อุตรดิตถ์ (Uttaradit)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  อุตรดิตถ์ (Uttaradit)
                </h3>
                <p className="mt-2 text-gray-700">
                  เมืองสงบ จุดเชื่อมภูเขา-น้ำตก ผลไม้ท้องถิ่นอร่อย
                </p>
              </div>
            </article>

            {/* ลำปาง */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/lampang.jpg"
                  alt="ลำปาง (Lampang)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  ลำปาง (Lampang)
                </h3>
                <p className="mt-2 text-gray-700">
                  เมืองรถม้า วัดไม้โบราณ กาแฟดี บรรยากาศชิล
                </p>
              </div>
            </article>

            {/* แม่ฮ่องสอน */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/mae-hong-son.jpg"
                  alt="แม่ฮ่องสอน (Mae Hong Son)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  แม่ฮ่องสอน (Mae Hong Son)
                </h3>
                <p className="mt-2 text-gray-700">
                  เส้นทางโค้ง วิวภูเขา ชุมชนไทใหญ่-ปกาเกอะญอ
                </p>
              </div>
            </article>

            {/* พิจิตร */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/phichit.jpg"
                  alt="พิจิตร (Phichit)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  พิจิตร (Phichit)
                </h3>
                <p className="mt-2 text-gray-700">
                  เมืองริมน้ำ วัดเก่า วิถีประมงพื้นถิ่น ของกินหลากหลาย
                </p>
              </div>
            </article>

            {/* แพร่ */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/phrae.jpg"
                  alt="แพร่ (Phrae)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  แพร่ (Phrae)
                </h3>
                <p className="mt-2 text-gray-700">
                  เมืองเก่ามีเสน่ห์ บ้านไม้สัก ผ้าหม้อฮ่อม คาเฟ่โลคอล
                </p>
              </div>
            </article>

            {/* น่าน */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/nan.jpg"
                  alt="น่าน (Nan)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">น่าน (Nan)</h3>
                <p className="mt-2 text-gray-700">
                  สายหมอก วัดงาม วิวภูเขา คาเฟ่ริมทุ่ง บรรยากาศชิล
                </p>
              </div>
            </article>

            {/* กำแพงเพชร */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/kamphaeng-phet.jpg"
                  alt="กำแพงเพชร (Kamphaeng Phet)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  กำแพงเพชร (Kamphaeng Phet)
                </h3>
                <p className="mt-2 text-gray-700">
                  อุทยานประวัติศาสตร์ เมืองมรดกโลก บ่อน้ำพุร้อน
                </p>
              </div>
            </article>

            {/* อุทัยธานี */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/uthaithani.jpg"
                  alt="อุทัยธานี (Uthai Thani)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  อุทัยธานี (Uthai Thani)
                </h3>
                <p className="mt-2 text-gray-700">
                  เมืองเงียบสงบ ริเวอร์ไซด์ ตลาดเก่า ธรรมชาติครบ
                </p>
              </div>
            </article>

            {/* พะเยา */}
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-44 w-full">
                <Image
                  src="/provinces/phayao.jpg"
                  alt="พะเยา (Phayao)"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  พะเยา (Phayao)
                </h3>
                <p className="mt-2 text-gray-700">
                  ชิลริมกว๊านพะเยา ชมพระอาทิตย์ตก วิถีล้านนาเรียบง่าย
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
