import Link from "next/link";

import { Avatar } from "@/components/ui";
import { RELATION_META } from "@/lib/constants";
import { buildProfileUrl, cn } from "@/lib/utils";

import type { Profile, RelationWithProfile } from "@/types/database";

interface ProfileSidebarWidgetsProps {
  profile: Profile;
  mutualConnections: Profile[];
  relations: RelationWithProfile[];
  viewerId: string | null;
  connectionStrength: number;
}

export function ProfileSidebarWidgets({
  profile,
  mutualConnections,
  relations,
  viewerId,
  connectionStrength,
}: ProfileSidebarWidgetsProps) {
  const skills = buildSkills(profile, relations);
  const achievements = buildAchievements(profile, relations);

  return (
    <aside className="space-y-5">
      {viewerId && viewerId !== profile.id && (
        <WidgetCard title="Connection strength">
          <div className="flex items-center gap-4">
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(rgb(220 38 38) ${connectionStrength * 3.6}deg, rgb(244 244 245) 0deg)`,
              }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink">
                {connectionStrength}%
              </div>
            </div>
            <ul className="space-y-2 text-xs text-zinc-600">
              <StrengthItem active={mutualConnections.length > 0}>
                {mutualConnections.length} mutual connection
                {mutualConnections.length === 1 ? "" : "s"}
              </StrengthItem>
              <StrengthItem active={Boolean(profile.city)}>
                Same region network
              </StrengthItem>
              <StrengthItem active={profile.is_verified}>
                Verified member
              </StrengthItem>
            </ul>
          </div>
        </WidgetCard>
      )}

      {mutualConnections.length > 0 && (
        <WidgetCard title="Mutual connections">
          <div className="flex flex-wrap gap-2">
            {mutualConnections.map((person) => (
              <Link
                key={person.id}
                href={buildProfileUrl(person.username)}
                title={person.full_name}
                className="transition hover:opacity-80"
              >
                <Avatar src={person.avatar_url} name={person.full_name} size={40} />
              </Link>
            ))}
          </div>
        </WidgetCard>
      )}

      {skills.length > 0 && (
        <WidgetCard title="Skills">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </WidgetCard>
      )}

      <WidgetCard title="Photos">
        <div className="grid grid-cols-3 gap-2">
          {[profile.avatar_url, profile.cover_url]
            .filter(Boolean)
            .slice(0, 3)
            .map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="aspect-square overflow-hidden rounded-xl bg-zinc-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src!} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          {(!profile.avatar_url && !profile.cover_url) && (
            <p className="col-span-3 text-sm text-zinc-500">No photos yet.</p>
          )}
        </div>
      </WidgetCard>

      {achievements.length > 0 && (
        <WidgetCard title="Achievements">
          <ul className="space-y-3">
            {achievements.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-zinc-500">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </WidgetCard>
      )}
    </aside>
  );
}

function WidgetCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.25rem] border border-zinc-200 bg-white p-5 shadow-soft">
      <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function StrengthItem({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className={cn("flex items-center gap-2", !active && "text-zinc-400")}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-brand-600" : "bg-zinc-300",
        )}
      />
      {children}
    </li>
  );
}

function buildSkills(profile: Profile, relations: RelationWithProfile[]) {
  const skills = new Set<string>();
  if (profile.occupation) skills.add(profile.occupation);
  if (profile.company) skills.add(profile.company);

  relations.slice(0, 4).forEach((relation) => {
    const label = RELATION_META[relation.relation_type]?.label;
    if (label) skills.add(label);
  });

  return [...skills].slice(0, 8);
}

function buildAchievements(profile: Profile, relations: RelationWithProfile[]) {
  const items: Array<{ title: string; description: string; icon: string }> = [];

  if (profile.is_verified) {
    items.push({
      title: "Verified member",
      description: "Identity confirmed on Legasi.",
      icon: "✓",
    });
  }

  if (relations.length >= 3) {
    items.push({
      title: "Community builder",
      description: `${relations.length} relationships mapped.`,
      icon: "★",
    });
  }

  if (profile.company) {
    items.push({
      title: "Business profile",
      description: profile.company,
      icon: "◆",
    });
  }

  return items.slice(0, 4);
}

export function computeConnectionStrength(
  profile: Profile,
  mutualCount: number,
): number {
  let score = 35;
  if (mutualCount > 0) score += Math.min(mutualCount * 12, 36);
  if (profile.is_verified) score += 10;
  if (profile.city) score += 8;
  if (profile.company) score += 6;
  return Math.min(score, 100);
}
