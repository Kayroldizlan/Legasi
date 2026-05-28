import {
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users as UsersIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { ProfileActions } from "@/components/profile/profile-actions";
import { ProfileCard } from "@/components/profile/profile-card";
import { SocialIcons } from "@/components/profile/social-icons";
import { Avatar, Badge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, buildProfileUrl, safeUrl } from "@/lib/utils";
import { getConnectionBetween } from "@/services/connections";
import {
  getProfileByUsername,
  getProfileStats,
  getSocialLinks,
} from "@/services/profiles";
import { listRelations } from "@/services/relations";

import { ProfileRelations } from "./profile-relations";

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

  const connection = user
    ? await getConnectionBetween(supabase, user.id, profile.id)
    : null;

  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const safeWebsite = safeUrl(profile.website);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      <main className="flex-1 bg-surface-muted">
        <div className="relative">
          <div
            className="h-44 sm:h-60 w-full bg-gradient-to-br from-brand-500 to-brand-800"
            style={
              profile.cover_url
                ? {
                    backgroundImage: `url(${profile.cover_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
        </div>

        <div className="container -mt-16 sm:-mt-20 grid gap-6 lg:grid-cols-[2fr_3fr] pb-12">
          <div className="card relative">
            <div className="flex flex-col items-start gap-4">
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name}
                size={112}
                ring
                online={profile.is_online}
              />
              <div className="space-y-1">
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                  {profile.full_name}
                  {profile.is_verified && (
                    <CheckCircle2 className="h-5 w-5 text-brand-600" />
                  )}
                </h1>
                <p className="text-sm text-ink-subtle">@{profile.username}</p>
                {profile.occupation && (
                  <p className="text-sm font-medium text-ink">{profile.occupation}</p>
                )}
                {profile.company && (
                  <p className="text-sm text-ink-muted inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> {profile.company}
                  </p>
                )}
                {location && (
                  <p className="text-sm text-ink-muted inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {location}
                  </p>
                )}
              </div>

              <ProfileActions profile={profile} initialConnection={connection} />

              <div className="grid grid-cols-3 gap-3 w-full pt-4 border-t border-border">
                <Stat label="Connections" value={stats?.connections_count ?? 0} />
                <Stat label="Relations"   value={stats?.relations_count ?? 0} />
                <Stat label="Member"      value={new Date(profile.created_at).getFullYear()} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="card">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-subtle mb-3">
                About
              </h2>
              {profile.bio ? (
                <p className="text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-ink-subtle italic">No bio yet.</p>
              )}

              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-subtle mt-6 mb-3">
                Contact
              </h3>
              <ul className="grid gap-2 text-sm sm:grid-cols-2">
                <ContactLine icon={Mail} value={profile.email} href={`mailto:${profile.email}`} />
                {profile.phone && (
                  <ContactLine icon={Phone} value={profile.phone} href={`tel:${profile.phone}`} />
                )}
                {safeWebsite && (
                  <ContactLine icon={Globe} value={profile.website ?? ""} href={safeWebsite} external />
                )}
                {profile.address && (
                  <ContactLine icon={MapPin} value={profile.address} />
                )}
              </ul>

              {socials && (
                <>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-subtle mt-6 mb-3">
                    Social
                  </h3>
                  <SocialIcons links={socials} />
                </>
              )}
            </section>

            <section className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-subtle">
                  Relationship hierarchy
                </h2>
                <Badge tone="brand">
                  <UsersIcon className="h-3 w-3" /> {relations.length} relations
                </Badge>
              </div>
              <ProfileRelations relations={relations} rootProfile={profile} />
            </section>

            {relations.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-3">Connected with</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relations.slice(0, 4).map((r) => (
                    <ProfileCard
                      key={r.id}
                      profile={r.related_profile}
                      variant="list"
                    />
                  ))}
                </div>
                {relations.length > 4 && (
                  <Link
                    href={`/u/${profile.username}/network`}
                    className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
                  >
                    View full network →
                  </Link>
                )}
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-semibold text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-ink-subtle">{label}</p>
    </div>
  );
}

function ContactLine({
  icon: Icon,
  value,
  href,
  external,
}: {
  icon: typeof Mail;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <span className="inline-flex items-center gap-2 truncate">
      <Icon className="h-3.5 w-3.5 text-ink-subtle shrink-0" />
      <span className="truncate">{value}</span>
    </span>
  );
  if (!href) return <li>{content}</li>;
  return (
    <li>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="text-ink hover:text-brand-600 transition"
      >
        {content}
      </a>
    </li>
  );
}
