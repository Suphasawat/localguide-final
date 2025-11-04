interface ProvinceHeroProps {
  title: string;
  description: string;
}

export default function ProvinceHero({
  title,
  description,
}: ProvinceHeroProps) {
  return (
    <section className="w-full bg-emerald-600 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold">{title}</h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed">
          {description}
        </p>

        <div className="mt-6">
          <a
            href="/user/trip-requires/create"
            className="inline-flex items-center rounded-full bg-white text-emerald-700 px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            โพสต์หาไกด์ท้องถิ่น
          </a>
        </div>
      </div>
    </section>
  );
}
