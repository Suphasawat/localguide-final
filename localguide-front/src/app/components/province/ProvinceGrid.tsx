import ProvinceCard from "./ProvinceCard";

interface ProvinceGridProps {
  provinces: Array<{
    name: string;
    nameEn: string;
    description: string;
    imageSrc: string;
  }>;
}

export default function ProvinceGrid({ provinces }: ProvinceGridProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {provinces.map((province) => (
            <ProvinceCard
              key={province.nameEn}
              name={province.name}
              nameEn={province.nameEn}
              description={province.description}
              imageSrc={province.imageSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
