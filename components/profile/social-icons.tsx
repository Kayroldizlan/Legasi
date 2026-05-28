import {
  Facebook,
  Instagram,
  Linkedin,
  MessageSquare,
  Music2,
  Twitter,
} from "lucide-react";

import type { SocialLinks } from "@/types/database";

const SOCIALS: { key: keyof SocialLinks; label: string; Icon: typeof Facebook; color: string }[] = [
  { key: "linkedin",  label: "LinkedIn",  Icon: Linkedin,        color: "text-[#0a66c2]" },
  { key: "twitter",   label: "X",         Icon: Twitter,         color: "text-ink" },
  { key: "facebook",  label: "Facebook",  Icon: Facebook,        color: "text-[#1877f2]" },
  { key: "instagram", label: "Instagram", Icon: Instagram,       color: "text-[#e1306c]" },
  { key: "tiktok",    label: "TikTok",    Icon: Music2,          color: "text-ink" },
  { key: "whatsapp",  label: "WhatsApp",  Icon: MessageSquare,   color: "text-[#25D366]" },
];

export function SocialIcons({ links }: { links: SocialLinks | null | undefined }) {
  if (!links) return null;

  const items = SOCIALS.filter((s) => {
    const value = links[s.key];
    return typeof value === "string" && value.length > 0;
  });
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ key, Icon, label, color }) => {
        const value = links[key] as string;
        const href =
          key === "whatsapp" && !value.startsWith("http")
            ? `https://wa.me/${value.replace(/[^0-9]/g, "")}`
            : value.startsWith("http")
              ? value
              : `https://${value}`;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            title={label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface hover:bg-surface-subtle transition"
          >
            <Icon className={`h-4 w-4 ${color}`} />
          </a>
        );
      })}
    </div>
  );
}
