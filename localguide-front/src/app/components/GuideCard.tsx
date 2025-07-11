import Image from "next/image";
import Link from "next/link";
import { Guide } from "../services/guide.service";

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  const name = `${guide.User?.FirstName || "-"} ${
    guide.User?.LastName || ""
  }`.trim();
  const avatar = guide.User?.Avatar || "/default-avatar.png";
  const location = [guide.District, guide.City, guide.Province]
    .filter(Boolean)
    .join(", ");
  const price = guide.Price ? `฿${guide.Price.toLocaleString()}/วัน` : "-";
  const languages = guide.Language?.length
    ? guide.Language.map((lang) => lang.Name).join(", ")
    : "ไม่มีข้อมูลภาษา";

  return (
    <Link
      href={`/guides/${guide.ID}`}
      className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
    >
      {/* Cover Image */}
      <div className="relative h-56 w-full">
        <Image
          src={avatar}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(guide.Rating || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-xs text-gray-500">
              ({guide.Rating || 0})
            </span>
          </div>
          <div className="text-amber-700 font-semibold">{price}</div>
        </div>
        <div className="text-gray-600 text-sm mb-1">{location}</div>
        <div className="text-xs text-amber-800 mt-2">ภาษา: {languages}</div>
      </div>
    </Link>
  );
}
