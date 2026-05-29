import { ArrowDown, Check, Heart, MessageSquare, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatObjectPosition } from "@/lib/profile-image-position";
import { buildProfileUrl, cn } from "@/lib/utils";

import type { DirectoryConnectionState } from "@/services/connections";
import type { Profile } from "@/types/database";

interface DirectoryMemberCardProps {
  profile: Profile;
  connectionsCount?: number;
  connection?: DirectoryConnectionState;
  isOwn?: boolean;
}

export function DirectoryMemberCard({
  profile,
  connectionsCount = 0,
  connection,
  isOwn = false,
}: DirectoryMemberCardProps) {
  const href = buildProfileUrl(profile.username);
  const location = [profile.city, profile.address, profile.country]
    .filter(Boolean)
    .join(", ");
  const imageSrc =
    profile.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=991b1b&color=fff&size=512`;

  return (
    <article className="overflow-hidden rounded-[1.25rem] border border-zinc-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-zinc-100">
        <Image
          src={imageSrc}
          alt={profile.full_name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          style={{
            objectPosition: formatObjectPosition(
              profile.avatar_position_x,
              profile.avatar_position_y,
            ),
          }}
        />
        {profile.is_online && (
          <span className="absolute left-3 top-3 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </Link>

      <div className="space-y-3 p-4">
        <div>
          <Link href={href} className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-ink">{profile.full_name}</h3>
            {profile.is_verified && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[10px] text-white">
                ✓
              </span>
            )}
          </Link>
          {profile.occupation && (
            <p className="mt-0.5 truncate text-sm text-zinc-500">
              {profile.occupation}
            </p>
          )}
          {location && (
            <p className="mt-0.5 truncate text-xs text-zinc-400">{location}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {Math.max(connectionsCount * 12, 24)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {connectionsCount}
          </span>
        </div>

        <DirectoryMemberCardActions
          profile={profile}
          href={href}
          connection={connection}
          isOwn={isOwn}
        />
      </div>
    </article>
  );
}

function DirectoryMemberCardActions({
  profile,
  href,
  connection,
  isOwn,
}: {
  profile: Profile;
  href: string;
  connection?: DirectoryConnectionState;
  isOwn: boolean;
}) {
  const primaryClass =
    "inline-flex flex-1 items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition";
  const iconClass =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50";

  if (isOwn) {
    return (
      <div className="flex gap-2">
        <Link
          href="/settings"
          className={cn(primaryClass, "border border-brand-600 text-brand-600 hover:bg-brand-50")}
        >
          Edit profile
        </Link>
      </div>
    );
  }

  if (connection?.kind === "accepted") {
    return (
      <div className="flex gap-2">
        <Link
          href={`/messages/${profile.id}`}
          className={cn(
            primaryClass,
            "bg-brand-600 text-white hover:bg-brand-700 shadow-[0_8px_24px_rgb(239_68_68/0.18)]",
          )}
        >
          <MessageSquare className="mr-1.5 h-4 w-4" />
          Message
        </Link>
        <Link
          href={href}
          className={iconClass}
          aria-label={`View ${profile.full_name}'s profile`}
        >
          <Check className="h-4 w-4 text-emerald-600" />
        </Link>
      </div>
    );
  }

  if (connection?.kind === "pending") {
    if (connection.direction === "sent") {
      return (
        <div className="flex gap-2">
          <span
            className={cn(
              primaryClass,
              "border border-zinc-200 bg-zinc-50 text-zinc-500",
            )}
          >
            Request sent
          </span>
          <Link
            href={href}
            className={iconClass}
            aria-label={`View ${profile.full_name}'s profile`}
          >
            <MessageSquare className="h-4 w-4" />
          </Link>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Link
          href={href}
          className={cn(
            primaryClass,
            "border border-brand-600 text-brand-600 hover:bg-brand-50",
          )}
        >
          Respond
        </Link>
        <Link
          href={href}
          className={iconClass}
          aria-label={`View ${profile.full_name}'s profile`}
        >
          <MessageSquare className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href={href}
        className={cn(
          primaryClass,
          "border border-brand-600 text-brand-600 hover:bg-brand-50",
        )}
      >
        Connect
      </Link>
      <Link
        href={href}
        className={iconClass}
        aria-label={`View ${profile.full_name}'s profile`}
      >
        <MessageSquare className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function DirectoryLoadMore({
  hasMore,
  nextHref,
}: {
  hasMore: boolean;
  nextHref: string;
}) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center pt-4">
      <Link
        href={nextHref}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-zinc-50"
      >
        Load more <ArrowDown className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function DirectoryCtaBanner() {
  return (
    <section className="rounded-[1.75rem] border border-brand-100 bg-brand-50 px-6 py-8 md:flex md:items-center md:justify-between md:gap-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">Expand your network</h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-600">
            Add your profile, connect with members across Malaysia, and start
            building your digital legacy today.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 md:mt-0">
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Add your profile
        </Link>
        <Link
          href="/about"
          className="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
        >
          Explore more
        </Link>
      </div>
    </section>
  );
}
