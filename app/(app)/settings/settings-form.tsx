"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

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
import {
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
  const router = useRouter();
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
    const ext = file.name.split(".").pop() || "png";
    const path = `${profile.id}/${field}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      cacheControl: "3600",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    const { error: upErr } = await supabase
      .from("profiles")
      .update({ [field]: publicUrl } as never)
      .eq("id", profile.id);
    if (upErr) return toast.error(upErr.message);

    if (field === "avatar_url") setAvatarUrl(publicUrl);
    else setCoverUrl(publicUrl);
    patchProfile({ [field]: publicUrl } as Partial<Profile>);
    toast.success("Image updated");
    router.refresh();
  };

  const onSubmitProfile = async (values: ProfileInput) => {
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        username: values.username.toLowerCase(),
        occupation: values.occupation || null,
        company: values.company || null,
        bio: values.bio || null,
        phone: values.phone || null,
        website: values.website || null,
        address: values.address || null,
        city: values.city || null,
        country: values.country || null,
      } as never)
      .eq("id", profile.id);
    setSavingProfile(false);
    if (error) return toast.error(error.message);
    patchProfile(values as Partial<Profile>);
    toast.success("Profile saved");
    router.refresh();
  };

  const onSubmitSocials = async (values: SocialLinksInput) => {
    setSavingSocials(true);
    const payload = {
      profile_id: profile.id,
      facebook: values.facebook || null,
      instagram: values.instagram || null,
      tiktok: values.tiktok || null,
      linkedin: values.linkedin || null,
      whatsapp: values.whatsapp || null,
      twitter: values.twitter || null,
    };
    const { error } = await supabase
      .from("social_links")
      .upsert(payload as never, { onConflict: "profile_id" });
    setSavingSocials(false);
    if (error) return toast.error(error.message);
    toast.success("Social links saved");
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div
          className="h-36 sm:h-44 w-full bg-gradient-to-br from-brand-500 to-brand-700 relative"
          style={
            coverUrl
              ? {
                  backgroundImage: `url(${coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <ImageUploadButton
            onChange={async (f) => {
              await uploadImage(f, "cover_url", "covers");
            }}
            label="Change cover"
            className="absolute right-4 top-4"
          />
        </div>
        <div className="px-6 pb-6 -mt-12 flex items-end gap-4">
          <div className="relative">
            <Avatar src={avatarUrl} name={profile.full_name} size={88} ring />
            <ImageUploadButton
              onChange={async (f) => {
                await uploadImage(f, "avatar_url", "avatars");
              }}
              label="Change"
              className="absolute -bottom-1 -right-1"
              compact
            />
          </div>
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
        <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="grid gap-4 sm:grid-cols-2">
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
            <Button type="submit" loading={savingProfile}>Save changes</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
          <CardDescription>Help people find you across the web.</CardDescription>
        </CardHeader>
        <form onSubmit={socialsForm.handleSubmit(onSubmitSocials)} className="grid gap-4 sm:grid-cols-2">
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

function ImageUploadButton({
  onChange,
  label,
  className,
  compact,
}: {
  onChange: (file: File) => Promise<void>;
  label: string;
  className?: string;
  compact?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  const handle = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    await onChange(file);
    setBusy(false);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 rounded-full bg-surface/95 border border-border px-3 py-1.5 text-xs font-medium shadow-soft hover:bg-surface ${
          compact ? "h-8 w-8 p-0 justify-center" : ""
        } ${className ?? ""}`}
        aria-label={label}
        title={label}
      >
        <Camera className="h-3.5 w-3.5" />
        {!compact && (busy ? "Uploading…" : label)}
      </button>
    </>
  );
}
