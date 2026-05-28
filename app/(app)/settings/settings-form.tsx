"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import * as React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  removeProfileImageAction,
  updateProfileAction,
  updateProfileImagePositionAction,
  updateSocialLinksAction,
  uploadProfileImageAction,
  type ProfileImageField,
  type ProfileImagePositionTarget,
} from "@/lib/actions/profile";
import { withActionTimeout } from "@/lib/client/with-action-timeout";
import { ImageDropzone } from "@/components/profile/image-dropzone";
import { ImagePositionEditor } from "@/components/profile/image-position-editor";
import {
  Avatar,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { MALAYSIAN_STATES } from "@/lib/constants";
import {
  SOCIAL_PLATFORMS,
  socialUrlToUsername,
  type SocialPlatformKey,
} from "@/lib/social-platforms";
import { compressAvatar, compressCover } from "@/lib/upload-image";
import {
  DEFAULT_PROFILE_IMAGE_POSITION,
  formatObjectPosition,
  getAvatarPosition,
  getCoverPosition,
} from "@/lib/profile-image-position";
import {
  normalizeProfileInput,
  PROFILE_BIO_MAX_LENGTH,
  profileSchema,
  socialLinksSchema,
  type ProfileInput,
  type SocialLinksInput,
} from "@/lib/validations";
import { useAuthStore } from "@/store/auth-store";

import type { Profile, SocialLinks } from "@/types/database";

interface Props {
  profile: Profile;
  socials: SocialLinks | null;
}

const ACTION_TIMEOUT_MS = 20_000;

type ProfileSnapshot = Pick<
  Profile,
  | "full_name"
  | "username"
  | "occupation"
  | "company"
  | "bio"
  | "phone"
  | "website"
  | "address"
  | "city"
  | "country"
>;

function snapshotProfile(profile: Profile): ProfileSnapshot {
  return {
    full_name: profile.full_name,
    username: profile.username,
    occupation: profile.occupation,
    company: profile.company,
    bio: profile.bio,
    phone: profile.phone,
    website: profile.website,
    address: profile.address,
    city: profile.city,
    country: profile.country,
  };
}

function profileToFormValues(snapshot: ProfileSnapshot): ProfileInput {
  return {
    full_name: snapshot.full_name,
    username: snapshot.username,
    occupation: snapshot.occupation ?? "",
    company: snapshot.company ?? "",
    bio: snapshot.bio ?? "",
    phone: snapshot.phone ?? "",
    website: snapshot.website ?? "",
    address: snapshot.address ?? "",
    city: snapshot.city ?? "",
    country: snapshot.country ?? "",
  };
}

function socialsToFormValues(socials: SocialLinks | null): SocialLinksInput {
  return {
    linkedin: socialUrlToUsername(socials?.linkedin, "linkedin"),
    twitter: socialUrlToUsername(socials?.twitter, "twitter"),
    facebook: socialUrlToUsername(socials?.facebook, "facebook"),
    instagram: socialUrlToUsername(socials?.instagram, "instagram"),
    tiktok: socialUrlToUsername(socials?.tiktok, "tiktok"),
    whatsapp: socials?.whatsapp ?? "",
  };
}

function profileSaveErrorMessage(error: string): string {
  if (/username|already taken/i.test(error)) {
    return "That username is already taken — your changes were rolled back.";
  }
  if (/session|sign in|authenticated/i.test(error)) {
    return error;
  }
  return `Could not save profile: ${error}`;
}

export function ProfileSettingsForm({ profile, socials }: Props) {
  const patchProfile = useAuthStore((s) => s.patchProfile);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingSocials, setSavingSocials] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatar_url);
  const [coverUrl, setCoverUrl] = React.useState(profile.cover_url);
  const [avatarPosition, setAvatarPosition] = React.useState(() =>
    getAvatarPosition(profile),
  );
  const [coverPosition, setCoverPosition] = React.useState(() =>
    getCoverPosition(profile),
  );
  const lastSavedAvatarPosition = React.useRef(getAvatarPosition(profile));
  const lastSavedCoverPosition = React.useRef(getCoverPosition(profile));

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileToFormValues(snapshotProfile(profile)),
  });
  const bioLength = (profileForm.watch("bio") ?? "").length;

  const socialsForm = useForm<SocialLinksInput>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: socialsToFormValues(socials),
  });

  const applyProfileSnapshot = React.useCallback(
    (snapshot: ProfileSnapshot) => {
      patchProfile(snapshot as Partial<Profile>);
      profileForm.reset(profileToFormValues(snapshot));
    },
    [patchProfile, profileForm],
  );

  const resetImagePosition = React.useCallback(
    (target: ProfileImagePositionTarget) => {
      const next = {
        x: DEFAULT_PROFILE_IMAGE_POSITION,
        y: DEFAULT_PROFILE_IMAGE_POSITION,
      };
      if (target === "avatar") {
        setAvatarPosition(next);
        lastSavedAvatarPosition.current = next;
        patchProfile({
          avatar_position_x: next.x,
          avatar_position_y: next.y,
        });
        return;
      }
      setCoverPosition(next);
      lastSavedCoverPosition.current = next;
      patchProfile({
        cover_position_x: next.x,
        cover_position_y: next.y,
      });
    },
    [patchProfile],
  );

  const saveImagePosition = React.useCallback(
    async (target: ProfileImagePositionTarget, x: number, y: number) => {
      const previous =
        target === "avatar"
          ? lastSavedAvatarPosition.current
          : lastSavedCoverPosition.current;

      const patch =
        target === "avatar"
          ? { avatar_position_x: x, avatar_position_y: y }
          : { cover_position_x: x, cover_position_y: y };

      patchProfile(patch);

      const result = await withActionTimeout(
        updateProfileImagePositionAction(target, x, y),
        ACTION_TIMEOUT_MS,
      );

      if (result.success) {
        if (target === "avatar") {
          lastSavedAvatarPosition.current = { x, y };
        } else {
          lastSavedCoverPosition.current = { x, y };
        }
        return;
      }

      if (target === "avatar") {
        setAvatarPosition(previous);
      } else {
        setCoverPosition(previous);
      }
      patchProfile({
        ...(target === "avatar"
          ? {
              avatar_position_x: previous.x,
              avatar_position_y: previous.y,
            }
          : {
              cover_position_x: previous.x,
              cover_position_y: previous.y,
            }),
      });
      toast.error(result.error || "Could not save image position.");
    },
    [patchProfile],
  );

  const uploadImage = async (
    file: File,
    field: ProfileImageField,
  ) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    const label = field === "avatar_url" ? "avatar" : "cover";
    const toastId = toast.loading(`Optimizing ${label}…`);
    const previousUrl = field === "avatar_url" ? avatarUrl : coverUrl;
    let optimisticUrl: string | null = null;

    try {
      const compress = field === "avatar_url" ? compressAvatar : compressCover;
      const optimized = await compress(file, (percent) => {
        if (percent < 100) {
          toast.loading(`Optimizing ${label}… ${Math.round(percent)}%`, {
            id: toastId,
          });
        }
      });

      optimisticUrl = URL.createObjectURL(optimized);
      if (field === "avatar_url") setAvatarUrl(optimisticUrl);
      else setCoverUrl(optimisticUrl);
      patchProfile({ [field]: optimisticUrl } as Partial<Profile>);

      toast.loading(`Uploading ${label}…`, { id: toastId });

      const formData = new FormData();
      formData.set("field", field);
      formData.set("file", optimized, `${field}.webp`);

      const result = await withActionTimeout(
        uploadProfileImageAction(formData),
        ACTION_TIMEOUT_MS,
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      if (field === "avatar_url") setAvatarUrl(result.data.publicUrl);
      else setCoverUrl(result.data.publicUrl);
      patchProfile({ [field]: result.data.publicUrl } as Partial<Profile>);
      resetImagePosition(field === "avatar_url" ? "avatar" : "cover");

      toast.success(
        field === "avatar_url" ? "Avatar updated" : "Cover updated",
        { id: toastId },
      );
    } catch (err) {
      if (field === "avatar_url") setAvatarUrl(previousUrl);
      else setCoverUrl(previousUrl);
      patchProfile({ [field]: previousUrl } as Partial<Profile>);

      const message =
        err instanceof Error ? err.message : "Could not update image.";
      toast.error(`${message} — please try again.`, { id: toastId });
    } finally {
      if (optimisticUrl) {
        const url = optimisticUrl;
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    }
  };

  const removeImage = async (field: ProfileImageField) => {
    const previousUrl = field === "avatar_url" ? avatarUrl : coverUrl;

    if (field === "avatar_url") setAvatarUrl(null);
    else setCoverUrl(null);
    patchProfile({ [field]: null } as Partial<Profile>);
    resetImagePosition(field === "avatar_url" ? "avatar" : "cover");

    const result = await withActionTimeout(
      removeProfileImageAction(field),
      ACTION_TIMEOUT_MS,
    );

    if (result.success) {
      toast.success("Image removed");
      return;
    }

    if (field === "avatar_url") setAvatarUrl(previousUrl);
    else setCoverUrl(previousUrl);
    patchProfile({ [field]: previousUrl } as Partial<Profile>);
    toast.error(result.error || "Could not remove image — please try again.");
  };

  const onSubmitProfile = async (values: ProfileInput) => {
    const normalized = normalizeProfileInput(values);
    const previous = snapshotProfile(profile);

    setSavingProfile(true);

    try {
      patchProfile(normalized as Partial<Profile>);
      profileForm.reset(profileToFormValues(normalized as ProfileSnapshot));

      const result = await withActionTimeout(
        updateProfileAction(values),
        ACTION_TIMEOUT_MS,
      );

      if (result.success) {
        toast.success("Profile saved");
        return;
      }

      applyProfileSnapshot(previous);
      toast.error(profileSaveErrorMessage(result.error));
    } catch (error: unknown) {
      applyProfileSnapshot(previous);
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error(profileSaveErrorMessage(message));
    } finally {
      setSavingProfile(false);
    }
  };

  const onProfileFormError = (
    errors: typeof profileForm.formState.errors,
  ) => {
    const first = Object.values(errors).find((e) => e && "message" in e);
    const message =
      first && "message" in first && typeof first.message === "string"
        ? first.message
        : "Please fix the highlighted fields and try again.";
    toast.error(message);
  };

  const onSubmitSocials = async (values: SocialLinksInput) => {
    const previous = socialsToFormValues(socials);

    setSavingSocials(true);

    try {
      socialsForm.reset(values);

      const result = await withActionTimeout(
        updateSocialLinksAction(values),
        ACTION_TIMEOUT_MS,
      );

      if (result.success) {
        toast.success("Social links saved");
        return;
      }

      socialsForm.reset(previous);
      toast.error(result.error || "Could not save links — please try again.");
    } finally {
      setSavingSocials(false);
    }
  };

  const onSocialsFormError = (
    errors: typeof socialsForm.formState.errors,
  ) => {
    const first = Object.values(errors).find((e) => e && "message" in e);
    const message =
      first && "message" in first && typeof first.message === "string"
        ? first.message
        : "Please fix the highlighted fields and try again.";
    toast.error(message);
  };

  const sectionCard =
    "rounded-[1.25rem] border-zinc-200 bg-white shadow-soft";

  return (
    <div className="space-y-6">
      <Card className={`overflow-hidden p-0 ${sectionCard}`}>
        <ImageDropzone
          shape="rect"
          hasImage={Boolean(coverUrl)}
          changeLabel="Change cover"
          emptyHint="Drop a cover image here"
          onUpload={(f) => uploadImage(f, "cover_url")}
          onRemove={coverUrl ? () => removeImage("cover_url") : undefined}
          className="h-36 sm:h-44 w-full overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 !rounded-none"
          actionsClassName="right-4 top-4"
        >
          {coverUrl && (
            <ImagePositionEditor
              editable
              shape="rect"
              className="absolute inset-0"
              positionX={coverPosition.x}
              positionY={coverPosition.y}
              onPositionChange={(x, y) => {
                setCoverPosition({ x, y });
                patchProfile({
                  cover_position_x: x,
                  cover_position_y: y,
                });
              }}
              onPositionCommit={(x, y) => void saveImagePosition("cover", x, y)}
            >
              <Image
                src={coverUrl}
                alt="Cover image"
                fill
                sizes="(min-width: 768px) 56rem, 100vw"
                className="object-cover"
                style={{
                  objectPosition: formatObjectPosition(
                    coverPosition.x,
                    coverPosition.y,
                  ),
                }}
                priority
                draggable={false}
              />
            </ImagePositionEditor>
          )}
        </ImageDropzone>
        <div className="px-6 pb-6 -mt-12 flex items-end gap-4">
          <ImageDropzone
            shape="circle"
            compact
            hasImage={Boolean(avatarUrl)}
            changeLabel="Change avatar"
            onUpload={(f) => uploadImage(f, "avatar_url")}
            onRemove={avatarUrl ? () => removeImage("avatar_url") : undefined}
            className="shrink-0"
            actionsClassName="-bottom-1 -right-1"
          >
            <ImagePositionEditor
              editable={Boolean(avatarUrl)}
              shape="circle"
              positionX={avatarPosition.x}
              positionY={avatarPosition.y}
              onPositionChange={(x, y) => {
                setAvatarPosition({ x, y });
                patchProfile({
                  avatar_position_x: x,
                  avatar_position_y: y,
                });
              }}
              onPositionCommit={(x, y) => void saveImagePosition("avatar", x, y)}
            >
              <Avatar
                src={avatarUrl}
                name={profile.full_name}
                size={88}
                ring
                objectPositionX={avatarPosition.x}
                objectPositionY={avatarPosition.y}
              />
            </ImagePositionEditor>
          </ImageDropzone>
          <div>
            <p className="text-lg font-semibold">{profile.full_name}</p>
            <p className="text-xs text-ink-subtle">@{profile.username}</p>
          </div>
        </div>
      </Card>

      <Card className={sectionCard}>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription className="text-zinc-500">
            This information appears on your public profile.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={profileForm.handleSubmit(onSubmitProfile, onProfileFormError)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Input label="Full name" {...profileForm.register("full_name")} error={profileForm.formState.errors.full_name?.message} />
          <Input label="Username" {...profileForm.register("username")} error={profileForm.formState.errors.username?.message} />
          <Input label="Occupation" {...profileForm.register("occupation")} />
          <Input label="Company / business" {...profileForm.register("company")} />
          <Input label="Phone" {...profileForm.register("phone")} />
          <Input label="Website" placeholder="https://yourdomain.com" {...profileForm.register("website")} error={profileForm.formState.errors.website?.message} />
          <Input label="City" {...profileForm.register("city")} />
          <Input label="Country" {...profileForm.register("country")} />
          <div className="sm:col-span-2">
            <Select
              label="State"
              {...profileForm.register("address")}
              error={profileForm.formState.errors.address?.message}
            >
              <option value="">Select state</option>
              {MALAYSIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Bio"
              rows={4}
              maxLength={PROFILE_BIO_MAX_LENGTH}
              showCount
              valueLength={bioLength}
              {...profileForm.register("bio")}
              error={profileForm.formState.errors.bio?.message}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={savingProfile}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card className={sectionCard}>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
          <CardDescription className="text-zinc-500">
            Enter your username — we&apos;ll add the platform link for you.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={socialsForm.handleSubmit(onSubmitSocials, onSocialsFormError)}
          className="grid gap-4 sm:grid-cols-2"
        >
          {(Object.keys(SOCIAL_PLATFORMS) as SocialPlatformKey[]).map((key) => {
            const platform = SOCIAL_PLATFORMS[key];
            return (
              <Input
                key={key}
                label={platform.label}
                prefix={platform.prefix}
                placeholder={platform.placeholder}
                autoComplete="off"
                {...socialsForm.register(key)}
                error={socialsForm.formState.errors[key]?.message}
              />
            );
          })}
          <Input label="WhatsApp number" placeholder="+60123456789" {...socialsForm.register("whatsapp")} />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={savingSocials}>Save social links</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
