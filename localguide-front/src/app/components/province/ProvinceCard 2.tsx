import Image from "next/image";

interface ProvinceCardProps {
  name: string;
  nameEn: string;
  description: string;
  imageSrc: string;
}

export default function ProvinceCard({
  name,
  nameEn,
  description,
  imageSrc,
}: ProvinceCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="relative h-44 w-full">
        <Image
          src={imageSrc}
          alt={`${name} (${nameEn})`}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900">
          {name} ({nameEn})
        </h3>
        <p className="mt-2 text-gray-700">{description}</p>
      </div>
    </article>
  );
}
