"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { ImageDropzone } from "@/components/profile/image-dropzone";
import {
  Avatar,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { compressAvatar, compressCover } from "@/lib/upload-image";
import {
  normalizeUrl,
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

export function ProfileSettingsForm({ profile, socials }: Props) {
  const patchProfile = useAuthStore((s) => s.patchProfile);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingSocials, setSavingSocials] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatar_url);
  const [coverUrl, setCoverUrl] = React.useState(profile.cover_url);

  const supabase = React.useMemo(() => createClient(), []);

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      username: profile.username,
      occupation: profile.occupation ?? "",
      company: profile.company ?? "",
      bio: profile.bio ?? "",
      phone: profile.phone ?? "",
      website: profile.website ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
    },
  });

  const socialsForm = useForm<SocialLinksInput>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      facebook: socials?.facebook ?? "",
      instagram: socials?.instagram ?? "",
      tiktok: socials?.tiktok ?? "",
      linkedin: socials?.linkedin ?? "",
      whatsapp: socials?.whatsapp ?? "",
      twitter: socials?.twitter ?? "",
    },
  });

  const uploadImage = async (
    file: File,
    field: "avatar_url" | "cover_url",
    bucket: "avatars" | "covers",
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
      // 1) Compress in a web worker (single pass) — fast, with live progress.
      const compress =
        field === "avatar_url" ? compressAvatar : compressCover;
      const optimized = await compress(file, (percent) => {
        if (percent < 100) {
          toast.loading(`Optimizing ${label}… ${Math.round(percent)}%`, {
            id: toastId,
          });
        }
      });

      // 2) Optimistic local preview + immediate success toast — the user
      //    sees their new image AND a "saved" confirmation the moment
      //    compression finishes. The upload + DB write run silently in
      //    the background.
      optimisticUrl = URL.createObjectURL(optimized);
      if (field === "avatar_url") setAvatarUrl(optimisticUrl);
      else setCoverUrl(optimisticUrl);
      patchProfile({ [field]: optimisticUrl } as Partial<Profile>);

      toast.success(
        field === "avatar_url" ? "Avatar updated" : "Cover updated",
        { id: toastId },
      );

      // 3) Background upload + DB update. Errors get their own toast.
      const path = `${profile.id}/${field}-${Date.now()}.webp`;
      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(path, optimized, {
          upsert: true,
          cacheControl: "3600",
          contentType: "image/webp",
        });
      if (uploadErr) throw uploadErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ [field]: publicUrl } as never)
        .eq("id", profile.id);
      if (dbErr) throw dbErr;

      // 4) Silently swap optimistic blob URL → public CDN URL so the
      //    image keeps working after this tab is closed or refreshed.
      if (field === "avatar_url") setAvatarUrl(publicUrl);
      else setCoverUrl(publicUrl);
      patchProfile({ [field]: publicUrl } as Partial<Profile>);
      // NOTE: deliberately no router.refresh() — zustand already holds
      // the new URL and a Server Component refresh would just add
      // 300–800 ms of jank for no visible change.
    } catch (err) {
      // Roll back the optimistic preview so reality and UI agree.
      if (field === "avatar_url") setAvatarUrl(previousUrl);
      else setCoverUrl(previousUrl);
      patchProfile({ [field]: previousUrl } as Partial<Profile>);

      const message =
        err instanceof Error ? err.message : "Could not update image.";
      toast.error(`${message} — please try again.`);
    } finally {
      // Defer the blob URL revoke so any in-flight <Image> render that
      // picked it up can finish before the browser invalidates the
      // handle.
      if (optimisticUrl) {
        const url = optimisticUrl;
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    }
  };

  const removeImage = async (field: "avatar_url" | "cover_url") => {
    const previousUrl = field === "avatar_url" ? avatarUrl : coverUrl;

    // OPTIMISTIC: clear locally and confirm immediately. The DB write
    // happens in the background.
    if (field === "avatar_url") setAvatarUrl(null);
    else setCoverUrl(null);
    patchProfile({ [field]: null } as Partial<Profile>);
    toast.success("Image removed");

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: null } as never)
      .eq("id", profile.id);

    if (error) {
      // Roll back so the UI matches the actual DB state.
      if (field === "avatar_url") setAvatarUrl(previousUrl);
      else setCoverUrl(previousUrl);
      patchProfile({ [field]: previousUrl } as Partial<Profile>);
      toast.error(error.message || "Could not remove image — please try again.");
    }
  };

  /** Convert empty strings to null and trim whitespace. */
  const cleanString = (v: string | undefined | null): string | null => {
    if (v == null) return null;
    const trimmed = v.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const onSubmitProfile = async (values: ProfileInput) => {
    // Image changes (avatar / cover) are saved independently by
    // uploadImage/removeImage. This handler always executes the profile
    // UPDATE query when Save Changes is clicked.
    console.log("SAVE CLICKED");

    const normalized = {
      full_name: values.full_name.trim(),
      username: values.username.toLowerCase().trim(),
      occupation: cleanString(values.occupation),
      company: cleanString(values.company),
      bio: cleanString(values.bio),
      phone: cleanString(values.phone),
      website: normalizeUrl(values.website),
      address: cleanString(values.address),
      city: cleanString(values.city),
      country: cleanString(values.country),
    };

    // Snapshot every editable field so rollback restores the form and
    // store to exactly what the user saw before clicking Save.
    const previous = {
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

    console.log("LOADING TRUE");
    setSavingProfile(true);

    try {
      // OPTIMISTIC UI — store + form update instantly, success toast
      // appears in the same render frame. The user-perceived latency is
      // bounded by browser frame time, not the Supabase roundtrip.
      patchProfile(normalized as Partial<Profile>);
      profileForm.reset({
        full_name: normalized.full_name,
        username: normalized.username,
        occupation: normalized.occupation ?? "",
        company: normalized.company ?? "",
        bio: normalized.bio ?? "",
        phone: normalized.phone ?? "",
        website: normalized.website ?? "",
        address: normalized.address ?? "",
        city: normalized.city ?? "",
        country: normalized.country ?? "",
      });
      toast.success("Profile saved");

      console.log("PROFILE UPDATE RUNNING");
      const { error } = await supabase
        .from("profiles")
        .update(normalized as never)
        .eq("id", profile.id);

      if (!error) {
        console.log("SUPABASE UPDATE SUCCESS");
      } else {
        // Roll the optimistic update back to match the actual DB state.
        patchProfile(previous as Partial<Profile>);
        profileForm.reset({
          full_name: previous.full_name,
          username: previous.username,
          occupation: previous.occupation ?? "",
          company: previous.company ?? "",
          bio: previous.bio ?? "",
          phone: previous.phone ?? "",
          website: previous.website ?? "",
          address: previous.address ?? "",
          city: previous.city ?? "",
          country: previous.country ?? "",
        });

        console.log("SUPABASE UPDATE ERROR", error);
        if (
          error.code === "23505" ||
          /duplicate key|unique constraint/i.test(error.message)
        ) {
          toast.error(
            "That username is already taken — your changes were rolled back.",
          );
        } else {
          toast.error(
            `Could not save profile: ${error.message || "please try again"}`,
          );
        }
      }
    } catch (error: unknown) {
      // Roll back optimistic state for unexpected failures.
      patchProfile(previous as Partial<Profile>);
      profileForm.reset({
        full_name: previous.full_name,
        username: previous.username,
        occupation: previous.occupation ?? "",
        company: previous.company ?? "",
        bio: previous.bio ?? "",
        phone: previous.phone ?? "",
        website: previous.website ?? "",
        address: previous.address ?? "",
        city: previous.city ?? "",
        country: previous.country ?? "",
      });

      console.log("SUPABASE UPDATE ERROR", error);
      const message =
        error instanceof Error ? error.message : "Unknown save error";
      toast.error(`Could not save profile: ${message}`);
    } finally {
      console.log("LOADING FALSE");
      setSavingProfile(false);
    }
  };

  /** Show the first Zod validation error in a toast so users never wonder
   *  why the Save button "did nothing". */
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
    // Always save on click. Keep social links form state normalized and
    // optimistic just like the profile form.

    const payload = {
      profile_id: profile.id,
      facebook: normalizeUrl(values.facebook),
      instagram: normalizeUrl(values.instagram),
      tiktok: normalizeUrl(values.tiktok),
      linkedin: normalizeUrl(values.linkedin),
      whatsapp: cleanString(values.whatsapp),
      twitter: normalizeUrl(values.twitter),
    };

    // Optimistic UI — reset the form to the normalized values and tell the
    // user it's saved right away. The actual upsert finishes in the
    // background and only surfaces if it fails.
    socialsForm.reset({
      facebook: payload.facebook ?? "",
      instagram: payload.instagram ?? "",
      tiktok: payload.tiktok ?? "",
      linkedin: payload.linkedin ?? "",
      whatsapp: payload.whatsapp ?? "",
      twitter: payload.twitter ?? "",
    });
    toast.success("Social links saved");

    setSavingSocials(true);
    const { error } = await supabase
      .from("social_links")
      .upsert(payload as never, { onConflict: "profile_id" });
    setSavingSocials(false);

    if (error) {
      toast.error(error.message || "Could not save links — please try again.");
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

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <ImageDropzone
          shape="rect"
          hasImage={Boolean(coverUrl)}
          changeLabel="Change cover"
          emptyHint="Drop a cover image here"
          onUpload={(f) => uploadImage(f, "cover_url", "covers")}
          onRemove={coverUrl ? () => removeImage("cover_url") : undefined}
          className="h-36 sm:h-44 w-full overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 !rounded-none"
          actionsClassName="right-4 top-4"
        >
          {coverUrl && (
            <Image
              src={coverUrl}
              alt="Cover image"
              fill
              sizes="(min-width: 768px) 56rem, 100vw"
              className="object-cover"
              priority
            />
          )}
        </ImageDropzone>
        <div className="px-6 pb-6 -mt-12 flex items-end gap-4">
          <ImageDropzone
            shape="circle"
            compact
            hasImage={Boolean(avatarUrl)}
            changeLabel="Change avatar"
            onUpload={(f) => uploadImage(f, "avatar_url", "avatars")}
            onRemove={avatarUrl ? () => removeImage("avatar_url") : undefined}
            className="shrink-0"
            actionsClassName="-bottom-1 -right-1"
          >
            <Avatar src={avatarUrl} name={profile.full_name} size={88} ring />
          </ImageDropzone>
          <div>
            <p className="text-lg font-semibold">{profile.full_name}</p>
            <p className="text-xs text-ink-subtle">@{profile.username}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>
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
            <Input label="Address" {...profileForm.register("address")} />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="Bio" rows={4} {...profileForm.register("bio")} error={profileForm.formState.errors.bio?.message} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
          <CardDescription>Help people find you across the web.</CardDescription>
        </CardHeader>
        <form
          onSubmit={socialsForm.handleSubmit(onSubmitSocials, onSocialsFormError)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Input label="LinkedIn" placeholder="https://linkedin.com/in/…" {...socialsForm.register("linkedin")} error={socialsForm.formState.errors.linkedin?.message} />
          <Input label="X / Twitter" placeholder="https://x.com/…" {...socialsForm.register("twitter")} error={socialsForm.formState.errors.twitter?.message} />
          <Input label="Facebook" placeholder="https://facebook.com/…" {...socialsForm.register("facebook")} error={socialsForm.formState.errors.facebook?.message} />
          <Input label="Instagram" placeholder="https://instagram.com/…" {...socialsForm.register("instagram")} error={socialsForm.formState.errors.instagram?.message} />
          <Input label="TikTok" placeholder="https://tiktok.com/@…" {...socialsForm.register("tiktok")} error={socialsForm.formState.errors.tiktok?.message} />
          <Input label="WhatsApp number" placeholder="+1234567890" {...socialsForm.register("whatsapp")} />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={savingSocials}>Save social links</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
