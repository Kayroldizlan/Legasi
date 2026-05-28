import { Building2, CheckCircle2, MapPin } from "lucide-react";
import Link from "next/link";

import { Avatar, Badge } from "@/components/ui";
import { buildProfileUrl } from "@/lib/utils";

import type { Profile } from "@/types/database";

interface ProfileCardProps {
  profile: Profile;
  variant?: "grid" | "list";
}

export function ProfileCard({ profile, variant = "grid" }: ProfileCardProps) {
  const href = buildProfileUrl(profile.username);
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  if (variant === "list") {
    return (
      <Link
        href={href}
        className="card flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-elevated transition"
      >
        <Avatar
          src={profile.avatar_url}
          name={profile.full_name}
          size={56}
          online={profile.is_online}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-ink">{profile.full_name}</p>
            {profile.is_verified && (
              <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
            )}
            <span className="text-xs text-ink-subtle">@{profile.username}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
            {profile.occupation && (
              <span className="inline-flex items-center gap-1">
                {profile.occupation}
              </span>
            )}
            {profile.company && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {profile.company}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {location}
              </span>
            )}
          </div>
          {profile.bio && (
            <p className="mt-2 text-sm text-ink-muted line-clamp-2">{profile.bio}</p>
          )}
        </div>
        <Badge tone="brand" className="hidden sm:inline-flex">
          View profile
        </Badge>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="card relative overflow-hidden p-0 hover:shadow-elevated hover:-translate-y-0.5 transition"
    >
      <div
        className="h-20 w-full bg-gradient-to-br from-brand-500 to-brand-700"
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
      <div className="px-5 pb-5 -mt-8">
        <Avatar
          src={profile.avatar_url}
          name={profile.full_name}
          size={64}
          ring
          online={profile.is_online}
        />
        <div className="mt-3">
          <p className="flex items-center gap-1.5 font-semibold text-ink truncate">
            {profile.full_name}
            {profile.is_verified && (
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
            )}
          </p>
          <p className="text-xs text-ink-subtle">@{profile.username}</p>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-ink-muted">
          {profile.occupation && (
            <p className="truncate">{profile.occupation}</p>
          )}
          {profile.company && (
            <p className="truncate inline-flex items-center gap-1.5">
              <Building2 className="h-3 w-3" /> {profile.company}
            </p>
          )}
          {location && (
            <p className="truncate inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> {location}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
