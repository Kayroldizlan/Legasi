/** Platform URL prefixes and username helpers for social link fields. */

export const SOCIAL_PLATFORMS = {
  linkedin: {
    label: "LinkedIn",
    prefix: "linkedin.com/in/",
    placeholder: "your-name",
  },
  twitter: {
    label: "X / Twitter",
    prefix: "x.com/",
    placeholder: "username",
  },
  facebook: {
    label: "Facebook",
    prefix: "facebook.com/",
    placeholder: "username",
  },
  instagram: {
    label: "Instagram",
    prefix: "instagram.com/",
    placeholder: "username",
  },
  tiktok: {
    label: "TikTok",
    prefix: "tiktok.com/@",
    placeholder: "username",
  },
} as const;

export type SocialPlatformKey = keyof typeof SOCIAL_PLATFORMS;

const PLATFORM_PREFIXES: Record<SocialPlatformKey, string[]> = {
  linkedin: ["linkedin.com/in/"],
  twitter: ["x.com/", "twitter.com/"],
  facebook: ["facebook.com/", "fb.com/"],
  instagram: ["instagram.com/"],
  tiktok: ["tiktok.com/@", "www.tiktok.com/@"],
};

function stripUrlDecorations(value: string): string {
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
}

/** Extract a handle from a stored URL (or return a bare username as-is). */
export function socialUrlToUsername(
  value: string | null | undefined,
  platform: SocialPlatformKey,
): string {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (!trimmed.includes("/") && !trimmed.includes(".")) {
    return trimmed.replace(/^@/, "");
  }

  const normalized = stripUrlDecorations(trimmed);

  for (const prefix of PLATFORM_PREFIXES[platform]) {
    if (normalized.toLowerCase().startsWith(prefix.toLowerCase())) {
      return normalized
        .slice(prefix.length)
        .split(/[/?#]/)[0]
        .replace(/^@/, "");
    }
  }

  try {
    const parsed = new URL(
      trimmed.includes("://") ? trimmed : `https://${normalized}`,
    );
    const segment = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    return segment.replace(/^@/, "");
  } catch {
    return trimmed.replace(/^@/, "");
  }
}

/** Build a full https URL from a username handle. */
export function socialUsernameToUrl(
  username: string | null | undefined,
  platform: SocialPlatformKey,
): string | null {
  const handle = username?.trim().replace(/^@/, "").split(/[/?#\s]/)[0];
  if (!handle) return null;
  return `https://${SOCIAL_PLATFORMS[platform].prefix}${handle}`;
}
