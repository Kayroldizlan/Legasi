import {
  Briefcase,
  Building2,
  CalendarDays,
  Globe,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import {
  ProfileComingSoon,
  ProfileSectionCard,
} from "@/components/profile/profile-page-sections";
import {
  computeConnectionStrength,
  ProfileSidebarWidgets,
} from "@/components/profile/profile-sidebar-widgets";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { SocialIcons } from "@/components/profile/social-icons";
import { EmptyState } from "@/components/ui";
import { RELATION_META } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import {
  absoluteUrl,
  buildProfileUrl,
  cn,
  safeUrl,
} from "@/lib/utils";
import {
  getConnectionBetween,
  getMutualConnections,
} from "@/services/connections";
import {
  getProfileByUsername,
  getProfileStats,
  getSocialLinks,
} from "@/services/profiles";
import { listRelations } from "@/services/relations";

import { ProfileRelations } from "./profile-relations";

import type { Profile, RelationWithProfile } from "@/types/database";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const profile = await getProfileByUsername(supabase, username);
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.full_name} (@${profile.username})`,
    description: profile.bio ?? `${profile.full_name}'s profile on Legasi.`,
    alternates: { canonical: absoluteUrl(buildProfileUrl(profile.username)) },
    openGraph: {
      title: `${profile.full_name} (@${profile.username})`,
      description: profile.bio ?? undefined,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
  };
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function buildTags(profile: Profile, relations: RelationWithProfile[]) {
  const tags = new Set<string>();
  if (profile.occupation) tags.add(profile.occupation);
  if (profile.company) tags.add(profile.company);
  relations.slice(0, 2).forEach((relation) => {
    const label = RELATION_META[relation.relation_type]?.label;
    if (label) tags.add(label);
  });
  return [...tags].slice(0, 4);
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const profile = await getProfileByUsername(supabase, username);
  if (!profile || profile.status !== "approved") notFound();

  const [{ data: { user } }, socials, stats, relations] = await Promise.all([
    supabase.auth.getUser(),
    getSocialLinks(supabase, profile.id),
    getProfileStats(supabase, profile.id),
    listRelations(supabase, profile.id),
  ]);

  const { data: connectionsRaw } = await supabase
    .from("connections")
    .select(
      "id, status, requester_id, addressee_id, requester:requester_id(*), addressee:addressee_id(*)",
    )
    .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .limit(12);

  const connectionProfiles: Profile[] = (
    (connectionsRaw ?? []) as unknown as Array<{
      requester_id: string;
      requester: Profile | Profile[] | null;
      addressee: Profile | Profile[] | null;
    }>
  )
    .map((row) => {
      const requester = Array.isArray(row.requester) ? row.requester[0] : row.requester;
      const addressee = Array.isArray(row.addressee) ? row.addressee[0] : row.addressee;
      return row.requester_id === profile.id ? addressee : requester;
    })
    .filter((person): person is Profile => person !== null);

  const connection = user
    ? await getConnectionBetween(supabase, user.id, profile.id)
    : null;

  const mutualConnections = user
    ? await getMutualConnections(supabase, user.id, profile.id)
    : [];

  const safeWebsite = safeUrl(profile.website);
  const websiteHost = safeWebsite
    ? safeWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : null;
  const joined = formatJoined(profile.created_at);
  const connectionsCount = stats?.connections_count ?? 0;
  const communitiesCount = relations.length;
  const networkCount = connectionsCount + communitiesCount;
  const badgesCount =
    (profile.is_verified ? 1 : 0) + Math.min(communitiesCount, 6);
  const connectionStrength = computeConnectionStrength(
    profile,
    mutualConnections.length,
  );

  const aboutPanel = (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <ProfileSectionCard title="About Me">
          {profile.bio ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm italic text-zinc-400">No bio yet.</p>
          )}

          <div className="mt-6 space-y-3">
            {profile.occupation && (
              <MetaRow icon={Briefcase} label="Current role" value={profile.occupation} />
            )}
            {profile.company && (
              <MetaRow icon={Building2} label="Company" value={profile.company} />
            )}
            {(profile.city || profile.country) && (
              <MetaRow
                icon={MapPin}
                label="Location"
                value={[profile.city, profile.country].filter(Boolean).join(", ")}
              />
            )}
            <MetaRow icon={CalendarDays} label="Joined" value={joined} />
            {safeWebsite && (
              <MetaRow
                icon={Globe}
                label="Website"
                value={websiteHost ?? safeWebsite}
                href={safeWebsite}
                external
              />
            )}
            <MetaRow
              icon={Mail}
              label="Email"
              value={profile.email}
              href={`mailto:${profile.email}`}
            />
            {profile.phone && (
              <MetaRow
                icon={Phone}
                label="Phone"
                value={profile.phone}
                href={`tel:${profile.phone}`}
              />
            )}
          </div>
        </ProfileSectionCard>

        {socials && (
          <ProfileSectionCard title="Find me on">
            <SocialIcons links={socials} />
          </ProfileSectionCard>
        )}
      </div>

      <ProfileSidebarWidgets
        profile={profile}
        mutualConnections={mutualConnections}
        relations={relations}
        viewerId={user?.id ?? null}
        connectionStrength={connectionStrength}
      />
    </div>
  );

  const connectionsPanel =
    connectionProfiles.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {connectionProfiles.map((person) => (
          <ProfileCard key={person.id} profile={person} variant="list" />
        ))}
      </div>
    ) : (
      <EmptyState
        title="No public connections yet"
        description={`When ${profile.full_name.split(" ")[0]} accepts connection requests, they'll show up here.`}
      />
    );

  const communitiesPanel = (
    <div className="space-y-6">
      <ProfileSectionCard
        title="Communities & relationships"
        action={
          <Link
            href={`/u/${profile.username}/network`}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            View full network
          </Link>
        }
      >
        <ProfileRelations rootProfile={profile} relations={relations} />
      </ProfileSectionCard>

      {relations.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {relations.slice(0, 6).map((relation) => (
            <ProfileCard
              key={relation.id}
              profile={relation.related_profile}
              variant="list"
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-zinc-50">
      <ProfilePageHeader
        profile={profile}
        connection={connection}
        tags={buildTags(profile, relations)}
        connectionsCount={connectionsCount}
        communitiesCount={communitiesCount}
        networkCount={networkCount}
        badgesCount={badgesCount}
      />

      <div className="px-4 py-8 lg:px-8">
        <ProfileTabs
          tabs={[
            { id: "about", label: "About" },
            { id: "activity", label: "Activity" },
            {
              id: "connections",
              label: (
                <span className="inline-flex items-center gap-1.5">
                  Connections
                  <TabCount value={connectionsCount} />
                </span>
              ),
            },
            {
              id: "communities",
              label: (
                <span className="inline-flex items-center gap-1.5">
                  Communities
                  <TabCount value={communitiesCount} />
                </span>
              ),
            },
            { id: "saved", label: "Saved" },
            { id: "businesses", label: "Businesses" },
            { id: "media", label: "Media" },
          ]}
          panels={{
            about: aboutPanel,
            activity: (
              <ProfileComingSoon
                icon={<Sparkles className="h-6 w-6" />}
                label="Activity"
              />
            ),
            connections: connectionsPanel,
            communities: communitiesPanel,
            saved: (
              <ProfileComingSoon
                icon={<Sparkles className="h-6 w-6" />}
                label="Saved"
              />
            ),
            businesses: (
              <ProfileComingSoon
                icon={<Building2 className="h-6 w-6" />}
                label="Businesses"
              />
            ),
            media: (
              <ProfileComingSoon
                icon={<ImageIcon className="h-6 w-6" />}
                label="Media"
              />
            ),
          }}
        />
      </div>
    </div>
  );
}

function TabCount({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
      {formatCompact(value)}
    </span>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-soft">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer nofollow" : undefined}
            className={cn(
              "block truncate text-sm font-medium text-ink hover:text-brand-600",
            )}
          >
            {value}
          </a>
        ) : (
          <p className="truncate text-sm font-medium text-ink">{value}</p>
        )}
      </div>
    </div>
  );
}
