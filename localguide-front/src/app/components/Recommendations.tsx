// components/ExtraRecommendations.tsx
import Image from "next/image";

type ExtraItem = {
  /** ข้อความบนการ์ด */
  title: string;
  /** พาธรูปใน /public */
  imageSrc: string;
  /** ลิงก์ภายนอก ปลอดภัยด้วย https เท่านั้น */
  href: `https://${string}`;
};

type ExtraRecommendationsProps = {
  /** ถ้าไม่ส่ง จะใช้รายการตัวอย่าง 4 ใบ */
  items?: ExtraItem[];
};

const defaultItems: ExtraItem[] = [
  {
    title: "อาหาร",
    imageSrc: "/rec/food.jpg",
    href: "https://resourcecenter.thaihealth.or.th/assets/mediadol/download_dol/b1239f99-48f9-e711-80de-00155d84fa40/downloaded_file_20250427155840.pdf",
  },
  {
    title: "เทศกาลและประเพณี",
    imageSrc: "/rec/festivals.jpg",
    href: "https://travel.kapook.com/view68566.html",
  },
  {
    title: "วัด",
    imageSrc: "/rec/temples.jpg",
    href: "https://travel.kapook.com/view254413.html",
  },
  {
    title: "สถานที่ท่องเที่ยว",
    imageSrc: "/rec/attractions.jpg",
    href: "https://travel.kapook.com/view207126.html",
  },
];

export default function Recommendations({
  items = defaultItems,
}: ExtraRecommendationsProps){
  return (
    <section aria-labelledby="extra-heading" className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-6">
        <h2
          id="extra-heading"
          className="mb-8 text-2xl md:text-3xl font-extrabold tracking-tight"
        >
          แนะนำเพิ่มเติม
        </h2>

        <div className="grid gap-8 md:grid-cols-2">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer external nofollow"
              aria-label={`เปิดลิงก์: ${item.title}`}
              className="group block"
            >
              <article className="relative overflow-hidden rounded-[22px] border border-black/10 shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                {/* อัตราส่วน 16:9 ให้ยาวแบบในภาพ */}
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={item.imageSrc}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(min-width:1024px) 48vw, 100vw"
                    priority={false}
                  />
                  {/* ขอบมนมีเส้น + เงาอ่อน */}
                  <div className="absolute inset-0 rounded-[22px] ring-1 ring-black/10" />
                  {/* ไล่เฉดให้ตัวอักษรอ่านง่าย */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
                  {/* ชื่อหมวดหมู่ มุมซ้ายล่าง */}
                  <span className="absolute left-4 bottom-3 text-white text-lg md:text-xl font-extrabold drop-shadow-sm">
                    {item.title}
                  </span>
                </div>
              </article>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
