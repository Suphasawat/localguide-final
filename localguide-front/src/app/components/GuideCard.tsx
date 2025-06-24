import Image from "next/image";
import Link from "next/link";
import { Guide } from "../services/guide.service";

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative h-60 w-full">
        <Image
          src={`https://source.unsplash.com/featured/400x300/?travel,guide&sig=${guide.id}`}
          alt={`${guide.user.firstName} ${guide.user.lastName}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-xl font-semibold text-white">
          {guide.user.firstName} {guide.user.lastName}
        </h3>
        <p className="text-white/90 text-sm">
          {guide.district && `${guide.district}, `}
          {guide.city}, {guide.province}
        </p>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(guide.rating || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-sm text-gray-500">
                ({guide.rating || 0})
              </span>
            </div>
          </div>
          <div className="text-lg font-semibold text-rose-600">
            ฿{guide.price.toLocaleString()}/วัน
          </div>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mt-2">{guide.bio}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {guide.languages.map((lang) => (
            <span
              key={lang.id}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800"
            >
              {lang.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
