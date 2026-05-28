import {
  Award,
  Briefcase,
  Building2,
  Globe,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";

interface ProfileStatCardsProps {
  connectionsCount: number;
  communitiesCount: number;
  networkCount: number;
  badgesCount: number;
}

function formatStat(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

const STATS = [
  { key: "connections", label: "Connections", icon: Users },
  { key: "communities", label: "Communities", icon: Building2 },
  { key: "network", label: "Network", icon: TrendingUp },
  { key: "badges", label: "Badges", icon: Award },
] as const;

export function ProfileStatCards({
  connectionsCount,
  communitiesCount,
  networkCount,
  badgesCount,
}: ProfileStatCardsProps) {
  const values = {
    connections: formatStat(connectionsCount),
    communities: formatStat(communitiesCount),
    network: formatStat(networkCount),
    badges: formatStat(badgesCount),
  };

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {STATS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="min-w-0 rounded-xl border border-zinc-200 bg-white px-2 py-3 shadow-soft sm:rounded-2xl sm:px-4 sm:py-4"
        >
          <div className="flex items-center gap-1 text-zinc-500 sm:gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0 text-brand-600 sm:h-4 sm:w-4" />
            <span className="truncate text-[10px] sm:text-xs">{label}</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-ink sm:mt-2 sm:text-2xl">
            {values[key]}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ProfileTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function ProfileMetaLine({
  occupation,
  company,
  location,
  website,
  websiteHost,
}: {
  occupation: string | null;
  company: string | null;
  location: string;
  website: string | null;
  websiteHost: string | null;
}) {
  const role = [occupation, company].filter(Boolean).join(" · ");

  return (
    <div className="space-y-2">
      {role && (
        <p className="inline-flex items-center gap-1.5 text-sm text-zinc-600">
          <Briefcase className="h-4 w-4 text-zinc-400" />
          {role}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
        {location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-zinc-400" />
            {location}
          </span>
        )}
        {website && websiteHost && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 hover:text-brand-600"
          >
            <Globe className="h-4 w-4 text-zinc-400" />
            {websiteHost}
          </a>
        )}
      </div>
    </div>
  );
}

export function ProfileSectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.25rem] border border-zinc-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProfileComingSoon({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <ProfileSectionCard title={label}>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          {icon}
        </span>
        <p className="text-sm text-zinc-500">
          {label} will be available here soon.
        </p>
      </div>
    </ProfileSectionCard>
  );
}
