import { Briefcase, Heart, UserPlus } from "lucide-react";

const CARDS = [
  {
    icon: UserPlus,
    title: "New connection",
    subtitle: "Alex joined your network",
  },
  {
    icon: Heart,
    title: "Family network",
    subtitle: "12 relatives mapped",
  },
  {
    icon: Briefcase,
    title: "Business community",
    subtitle: "8 partners linked",
  },
] as const;

export function FloatingPreviewCards() {
  return (
    <>
      {CARDS.map((card, index) => {
        const Icon = card.icon;
        const positions = [
          "left-[4%] top-[18%] hidden sm:block",
          "right-[6%] top-[28%]",
          "right-[10%] bottom-[16%] hidden md:block",
        ] as const;

        return (
          <div
            key={card.title}
            className={`absolute ${positions[index]} z-10 max-w-[190px] rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-md shadow-[0_0_30px_rgb(239_68_68/0.08)]`}
          >
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{card.title}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{card.subtitle}</p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
