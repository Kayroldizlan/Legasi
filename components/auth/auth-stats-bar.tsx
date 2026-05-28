import {
  Globe2,
  Network,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

function formatStat(value: number, suffix = "+") {
  if (value <= 0) return "100+";
  if (value >= 1000) {
    const formatted =
      value >= 10000
        ? `${Math.round(value / 1000)}k`
        : `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return `${formatted}${suffix}`;
  }
  return `${value}${suffix}`;
}

const STATIC_STATS = [
  {
    icon: Network,
    value: "250+",
    label: "Communities",
    text: "Active groups connecting members every day.",
  },
  {
    icon: Globe2,
    value: "15+",
    label: "Countries",
    text: "Members building networks across regions.",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Secure",
    text: "Protected auth with row-level security.",
  },
] as const;

interface AuthStatsBarProps {
  membersCount: number;
}

export function AuthStatsBar({ membersCount }: AuthStatsBarProps) {
  const stats = [
    {
      icon: UsersRound,
      value: formatStat(membersCount),
      label: "Active members",
      text: "Professionals, families, and teams on Legasi.",
    },
    ...STATIC_STATS,
  ];

  return (
    <section className="border-y border-zinc-200 bg-white">
      <div className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, value, label, text }) => (
          <div key={label} className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-ink">{value}</p>
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
