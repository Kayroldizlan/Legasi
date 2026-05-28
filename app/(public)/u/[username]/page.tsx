import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Globe,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Users as UsersIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { ProfileActions } from "@/components/profile/profile-actions";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileShareCard } from "@/components/profile/profile-share-card";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { SocialIcons } from "@/components/profile/social-icons";
import { Avatar, EmptyState } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import {
  absoluteUrl,
  buildProfileUrl,
  cn,
  safeUrl,
} from "@/lib/utils";
import { getConnectionBetween } from "@/services/connections";
import {
  getProfileByUsername,
  getProfileStats,
  getSocialLinks,
} from "@/services/profiles";
import { listRelations } from "@/services/relations";

import { ProfileRelations } from "./profile-relations";

import type { Profile } from "@/types/database";

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
    description: profile.bio ?? `${profile.full_name}'s profile on ConnectDirectory.`,
    alternates: { canonical: absoluteUrl(buildProfileUrl(profile.username)) },
    openGraph: {
      title: `${profile.full_name} (@${profile.username})`,
      description: profile.bio ?? undefined,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
  };
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
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

  // Top connections (accepted). We pull both sides of the connection so we
  // can show the other party regardless of who initiated.
  const { data: connectionsRaw } = await supabase
    .from("connections")
    .select(
      "id, status, requester_id, addressee_id, requester:requester_id(*), addressee:addressee_id(*)",
    )
    .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .limit(12);

  // Supabase types nested embeds as arrays even when the FK is 1:1, so we
  // narrow via `unknown` and then unwrap if the runtime returns an array.
  const connectionProfiles: Profile[] = (
    (connectionsRaw ?? []) as unknown as Array<{
      requester_id: string;
      requester: Profile | Profile[] | null;
      addressee: Profile | Profile[] | null;
    }>
  )
    .map((c) => {
      const requester = Array.isArray(c.requester) ? c.requester[0] : c.requester;
      const addressee = Array.isArray(c.addressee) ? c.addressee[0] : c.addressee;
      const other = c.requester_id === profile.id ? addressee : requester;
      return other ?? null;
    })
    .filter((p): p is Profile => p !== null);

  const connection = user
    ? await getConnectionBetween(supabase, user.id, profile.id)
    : null;

  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const safeWebsite = safeUrl(profile.website);
  const websiteHost = safeWebsite
    ? safeWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : null;
  const joined = formatJoined(profile.created_at);
  const profileUrl = absoluteUrl(buildProfileUrl(profile.username));

  const connectionsCount = stats?.connections_count ?? 0;
  const networkCount = relations.length;

  // -- Tab panels ---------------------------------------------------------

  const aboutPanel = (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="card">
        <h2 className="text-base font-semibold text-ink">About Me</h2>
        {profile.bio ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
            {profile.bio}
          </p>
        ) : (
          <p className="mt-3 text-sm italic text-ink-subtle">No bio yet.</p>
        )}

        <div className="mt-6 space-y-3">
          {profile.occupation && (
            <MetaRow icon={Briefcase} label="Occupation" value={profile.occupation} />
          )}
          {profile.company && (
            <MetaRow icon={Building2} label="Company" value={profile.company} />
          )}
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
          {profile.address && (
            <MetaRow icon={MapPin} label="Address" value={profile.address} />
          )}
        </div>
      </section>

      <aside className="space-y-6">
        {socials && (
          <div className="card">
            <h3 className="text-base font-semibold text-ink">Find me on</h3>
            <p className="mt-1 text-xs text-ink-subtle">
              Connect across platforms.
            </p>
            <div className="mt-4">
              <SocialIcons links={socials} />
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="text-base font-semibold text-ink">Member info</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-ink-muted">
                <CalendarDays className="h-4 w-4 text-ink-subtle" /> Joined
              </span>
              <span className="font-medium text-ink">{joined}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-ink-muted">
                <UsersIcon className="h-4 w-4 text-ink-subtle" /> Connections
              </span>
              <span className="font-medium text-ink">
                {formatCompact(connectionsCount)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-ink-muted">
                <Sparkles className="h-4 w-4 text-ink-subtle" /> Network
              </span>
              <span className="font-medium text-ink">
                {formatCompact(networkCount)}
              </span>
            </li>
            {profile.is_verified && (
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-ink-muted">
                  <BadgeCheck className="h-4 w-4 text-brand-600" /> Status
                </span>
                <span className="font-medium text-ink">Verified</span>
              </li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  );

  const connectionsPanel =
    connectionProfiles.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connectionProfiles.map((p) => (
          <ProfileCard key={p.id} profile={p} variant="list" />
        ))}
      </div>
    ) : (
      <EmptyState
        title="No public connections yet"
        description={`When ${profile.full_name.split(" ")[0]} accepts connection requests, they'll show up here.`}
      />
    );

  const networkPanel = (
    <div className="space-y-6">
      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">
            Relationship hierarchy
          </h2>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            {networkCount} relations
          </span>
        </div>
        <ProfileRelations relations={relations} rootProfile={profile} />
      </section>

      {relations.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-subtle">
            Connected family & team
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relations.slice(0, 6).map((r) => (
              <ProfileCard
                key={r.id}
                profile={r.related_profile}
                variant="list"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const comingSoonPanel = (icon: React.ReactNode, label: string) => (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        {icon}
      </span>
      <h3 className="text-base font-semibold text-ink">{label} are coming soon</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">
        We're working on bringing rich {label.toLowerCase()} to every profile.
        Check back shortly.
      </p>
    </div>
  );

  // -- Render -------------------------------------------------------------

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      <main className="flex-1 bg-surface-muted">
        {/* Hero: cover with floating QR */}
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 sm:h-60 lg:h-72">
          {profile.cover_url ? (
            <Image
              src={profile.cover_url}
              alt={`${profile.full_name} cover`}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <DefaultCoverDecoration />
          )}

          {/* Floating QR share card — desktop only inside the cover */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <div className="container relative h-full">
              <div className="pointer-events-auto absolute right-0 top-4">
                <ProfileShareCard
                  url={profileUrl}
                  fullName={profile.full_name}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Identity block */}
        <div className="container -mt-12 pb-12 sm:-mt-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <div className="flex-1">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                <Avatar
                  src={profile.avatar_url}
                  name={profile.full_name}
                  size={120}
                  ring
                  online={profile.is_online}
                  className="!ring-4 !ring-surface"
                />
                <div className="sm:pb-2">
                  <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {profile.full_name}
                    {profile.is_verified && (
                      <BadgeCheck
                        className="h-6 w-6 text-brand-600"
                        aria-label="Verified"
                      />
                    )}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-ink-subtle">@{profile.username}</span>
                    {profile.is_verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                        <BadgeCheck className="h-3 w-3" /> Verified Member
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5">
                <ProfileActions profile={profile} initialConnection={connection} />
              </div>

              {/* Meta line */}
              <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
                {(profile.occupation || profile.company) && (
                  <li className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-ink-subtle" />
                    {[profile.occupation, profile.company]
                      .filter(Boolean)
                      .join(" at ")}
                  </li>
                )}
                {location && (
                  <li className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-ink-subtle" />
                    {location}
                  </li>
                )}
                {safeWebsite && websiteHost && (
                  <li className="inline-flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-ink-subtle" />
                    <a
                      href={safeWebsite}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="hover:text-brand-600 hover:underline"
                    >
                      {websiteHost}
                    </a>
                  </li>
                )}
                <li className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-ink-subtle" />
                  Joined {joined}
                </li>
              </ul>

              {profile.bio && (
                <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                  {profile.bio}
                </p>
              )}

              {socials && (
                <div className="mt-5">
                  <SocialIcons links={socials} />
                </div>
              )}
            </div>

            {/* Mobile/tablet share card */}
            <div className="lg:hidden">
              <ProfileShareCard url={profileUrl} fullName={profile.full_name} />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-10">
            <ProfileTabs
              tabs={[
                { id: "about", label: "About" },
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
                  id: "network",
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      Network
                      <TabCount value={networkCount} />
                    </span>
                  ),
                },
                { id: "posts", label: "Posts" },
                { id: "media", label: "Media" },
              ]}
              panels={{
                about: aboutPanel,
                connections: connectionsPanel,
                network: networkPanel,
                posts: comingSoonPanel(<Sparkles className="h-6 w-6" />, "Posts"),
                media: comingSoonPanel(<ImageIcon className="h-6 w-6" />, "Media"),
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- helpers ---------- */

function TabCount({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="rounded-full bg-surface-subtle px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
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
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted/40 px-3 py-2.5">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
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

/**
 * Subtle abstract mountain shapes painted in white over the brand gradient,
 * used as a default cover when the profile doesn't have a custom one.
 * Mirrors the mountain motif in the design mockup.
 */
function DefaultCoverDecoration() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 320"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="cover-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path
        d="M0 240 L200 140 L360 220 L520 120 L720 230 L900 130 L1080 220 L1200 170 L1200 320 L0 320 Z"
        fill="url(#cover-fade)"
      />
      <path
        d="M0 280 L160 220 L320 270 L500 200 L680 280 L860 210 L1040 280 L1200 240 L1200 320 L0 320 Z"
        fill="rgba(255,255,255,0.12)"
      />
    </svg>
  );
}
