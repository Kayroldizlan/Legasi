export const DEFAULT_PROFILE_IMAGE_POSITION = 50;

export function clampProfileImagePosition(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)));
}

export function formatObjectPosition(
  x: number | null | undefined,
  y: number | null | undefined,
): string {
  const px = clampProfileImagePosition(x ?? DEFAULT_PROFILE_IMAGE_POSITION);
  const py = clampProfileImagePosition(y ?? DEFAULT_PROFILE_IMAGE_POSITION);
  return `${px}% ${py}%`;
}

export function getAvatarPosition(profile: {
  avatar_position_x?: number | null;
  avatar_position_y?: number | null;
}) {
  return {
    x: profile.avatar_position_x ?? DEFAULT_PROFILE_IMAGE_POSITION,
    y: profile.avatar_position_y ?? DEFAULT_PROFILE_IMAGE_POSITION,
  };
}

export function getCoverPosition(profile: {
  cover_position_x?: number | null;
  cover_position_y?: number | null;
}) {
  return {
    x: profile.cover_position_x ?? DEFAULT_PROFILE_IMAGE_POSITION,
    y: profile.cover_position_y ?? DEFAULT_PROFILE_IMAGE_POSITION,
  };
}
