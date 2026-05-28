import { Globe2, Network, Sparkles, UsersRound } from "lucide-react";

interface DirectoryStatsBarProps {
  membersCount: number;
  connectionsCount: number;
}

function formatStat(value: number, fallback: string) {
  if (value <= 0) return fallback;
  if (value >= 1000) return `${Math.round(value / 100) * 100}+`;
  return `${value}+`;
}

export function DirectoryStatsBar({
  membersCount,
  connectionsCount,
}: DirectoryStatsBarProps) {
  const stats = [
    {
      icon: UsersRound,
      value: formatStat(membersCount, "10,000+"),
      label: "Members",
    },
    {
      icon: Network,
      value: "250+",
      label: "Communities",
    },
    {
      icon: Globe2,
      value: "15+",
      label: "States",
    },
    {
      icon: Sparkles,
      value: connectionsCount > 0 ? formatStat(connectionsCount, "1k+") : "Unlimited",
      label: "Connections",
    },
  ] as const;

  return (
    <section className="border-b border-zinc-100 bg-zinc-50/80">
      <div className="grid grid-cols-2 gap-3 px-4 py-5 lg:grid-cols-4 lg:px-8">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-semibold text-ink">{value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
