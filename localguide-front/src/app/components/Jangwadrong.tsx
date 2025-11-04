import Link from "next/link";
import Image from "next/image";

type ProvinceItem = {
  nameTh: string;           // ชื่อจังหวัดบนรูป
  slug: string;             // ใช้ทำลิงก์ภายใน ถ้าไม่มี href
  imageSrc: string;         // พาธรูปใน /public
  href?: string;            // ลิงก์ปลายทาง (ภายนอก/ภายใน)
};

type SecondaryProvincesNorthProps = {
  items?: ProvinceItem[];
  seeAllHref?: string;
};

const defaultItems: ProvinceItem[] = [
  {
    nameTh: "เชียงราย",
    slug: "chiang-rai",
    imageSrc: "/provinces/chiang-rai.jpg",
    href: "https://th.wikipedia.org/wiki/%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B8%A3%E0%B8%B2%E0%B8%A2",
  },
  {
    nameTh: "เพชรบูรณ์",
    slug: "phetchabun",
    imageSrc: "/provinces/phetchabun.jpg",
    href: "https://th.wikipedia.org/wiki/%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%9E%E0%B8%8A%E0%B8%A3%E0%B8%9A%E0%B8%B9%E0%B8%A3%E0%B8%93%E0%B9%8C",
  },
  {
    nameTh: "แม่ฮ่องสอน",
    slug: "mae-hong-son",
    imageSrc: "/provinces/mae-hong-son.jpg",
    href: "https://th.wikipedia.org/wiki/%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%81%E0%B8%A1%E0%B9%88%E0%B8%AE%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B8%AD%E0%B8%99",
  },
];

export default function Jangwadrong({
  items = defaultItems,
}: SecondaryProvincesNorthProps) {
  return (
    <>
    <div
      aria-labelledby="secondary-north-heading"
      className="bg-white py-16 md:py-20"
    >
      <div className="container mx-auto px-6">
        <h2
          id="secondary-north-heading"
          className="mb-8 text-2xl md:text-3xl font-extrabold tracking-tight"
        >
          แนะนำจังหวัดรองภาคเหนือ
        </h2>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {items.map((p) => {
            const href = p.href ?? `/provinces/${p.slug}`;
            return (
              <Link
                key={p.slug}
                href={href}
                // เปิดแท็บใหม่ (ถ้าอยากให้เปิดแท็บเดิม ลบสองพร็อพนี้ออก)
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`ไปยังจังหวัด ${p.nameTh}`}
                className="group block"
              >
                <article className="relative overflow-hidden rounded-[28px] shadow-sm ring-1 ring-black/10 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={p.imageSrc}
                      alt={p.nameTh}
                      fill
                      className="object-cover"
                      sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="px-3 text-white text-2xl md:text-3xl font-extrabold tracking-wide drop-shadow-sm">
                        {p.nameTh}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
