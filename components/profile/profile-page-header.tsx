import { BadgeCheck } from "lucide-react";
import Image from "next/image";

import { ProfileActions } from "@/components/profile/profile-actions";
import {
  ProfileMetaLine,
  ProfileStatCards,
  ProfileTags,
} from "@/components/profile/profile-page-sections";
import { Avatar } from "@/components/ui";
import { formatObjectPosition } from "@/lib/profile-image-position";

import type { Connection, Profile } from "@/types/database";

interface ProfilePageHeaderProps {
  profile: Profile;
  connection: Connection | null;
  tags: string[];
  connectionsCount: number;
  communitiesCount: number;
  networkCount: number;
  badgesCount: number;
}

export function ProfilePageHeader({
  profile,
  connection,
  tags,
  connectionsCount,
  communitiesCount,
  networkCount,
  badgesCount,
}: ProfilePageHeaderProps) {
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const websiteHost = profile.website
    ? profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : null;

  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="relative h-44 overflow-hidden sm:h-52 lg:h-56">
        {profile.cover_url ? (
          <Image
            src={profile.cover_url}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: formatObjectPosition(
                profile.cover_position_x,
                profile.cover_position_y,
              ),
            }}
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-white" />
        )}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgb(239_68_68/0.08),transparent_55%)]" />
        <WaveDivider />
      </div>

      <div className="relative z-10 bg-white px-4 pb-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="-mt-14 shrink-0 self-start lg:-mt-16">
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name}
                size={112}
                ring
                online={profile.is_online}
                objectPositionX={profile.avatar_position_x}
                objectPositionY={profile.avatar_position_y}
                className="!ring-4 !ring-white shadow-elevated"
              />
            </div>
            <div className="min-w-0 space-y-2 pb-1">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {profile.full_name}
                  {profile.is_verified && (
                    <BadgeCheck
                      className="h-6 w-6 text-brand-600"
                      aria-label="Verified"
                    />
                  )}
                </h1>
                <p className="mt-1 text-sm font-medium text-zinc-600">
                  @{profile.username}
                </p>
              </div>
              <ProfileMetaLine
                occupation={profile.occupation}
                company={profile.company}
                location={location}
                website={profile.website}
                websiteHost={websiteHost}
              />
              <ProfileTags tags={tags} />
            </div>
          </div>

          <div className="shrink-0 lg:pt-1">
            <ProfileActions
              profile={profile}
              initialConnection={connection}
              variant="header"
            />
          </div>
        </div>

        <div className="mt-6">
          <ProfileStatCards
            connectionsCount={connectionsCount}
            communitiesCount={communitiesCount}
            networkCount={networkCount}
            badgesCount={badgesCount}
          />
        </div>
      </div>
    </section>
  );
}

function WaveDivider() {
  return (
    <svg
      className="absolute bottom-0 left-0 z-[1] w-full text-white"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M0,48 C240,80 480,16 720,48 C960,80 1200,24 1440,48 L1440,80 L0,80 Z"
      />
    </svg>
  );
}
