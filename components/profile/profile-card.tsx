import { Building2, CheckCircle2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Avatar, Badge } from "@/components/ui";
import { formatObjectPosition } from "@/lib/profile-image-position";
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
          objectPositionX={profile.avatar_position_x}
          objectPositionY={profile.avatar_position_y}
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
      <div className="relative h-20 w-full overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700">
        {profile.cover_url && (
          <Image
            src={profile.cover_url}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            style={{
              objectPosition: formatObjectPosition(
                profile.cover_position_x,
                profile.cover_position_y,
              ),
            }}
            loading="lazy"
          />
        )}
      </div>
      <div className="px-5 pb-5 -mt-8">
        <Avatar
          src={profile.avatar_url}
          name={profile.full_name}
          size={64}
          ring
          online={profile.is_online}
          objectPositionX={profile.avatar_position_x}
          objectPositionY={profile.avatar_position_y}
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
