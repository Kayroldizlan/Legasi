import Image from "next/image";

interface DirectoryHeroProps {
  membersCount: number;
}

export function DirectoryHero({ membersCount }: DirectoryHeroProps) {
  const memberLabel =
    membersCount >= 1000
      ? `${Math.round(membersCount / 100) * 100}+`
      : membersCount > 0
        ? `${membersCount}+`
        : "100+";

  return (
    <section className="border-b border-zinc-100 bg-white">
      <div className="px-4 py-8 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl lg:text-5xl">
              Discover meaningful{" "}
              <span className="text-brand-600">connections</span>
            </h1>
            <p className="mt-3 text-sm text-zinc-500 md:text-base">
              Explore people, families, businesses, and communities across
              Malaysia. {memberLabel} members already building their legacy.
            </p>
          </div>

          <div className="relative mx-auto hidden h-40 w-full max-w-md lg:block xl:max-w-lg">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_50%_50%,rgb(239_68_68/0.08),transparent_70%)]" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="absolute h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-md"
                style={{
                  left: `${[8, 28, 52, 70, 18, 62][i]}%`,
                  top: `${[20, 8, 24, 52, 58, 68][i]}%`,
                }}
              >
                <Image
                  src={`https://ui-avatars.com/api/?name=Member+${i + 1}&background=991b1b&color=fff&size=80`}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
