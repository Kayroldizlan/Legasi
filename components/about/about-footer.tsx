import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

import { Logo } from "../layout/logo";

const FOOTER_LINKS = {
  Platform: [
    { href: "/directory", label: "Directory" },
    { href: "/about", label: "About" },
    { href: "/register", label: "Sign up" },
  ],
  Support: [
    { href: "/about", label: "Help center" },
    { href: "/about", label: "Contact" },
    { href: "/about", label: "FAQ" },
  ],
  Company: [
    { href: "/about", label: "Our story" },
    { href: "/about", label: "Privacy" },
    { href: "/about", label: "Terms" },
  ],
} as const;

export function AboutFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] text-zinc-300">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo inverted />
          <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
            Preserving connections across generations. A modern directory for
            families, teams, and communities that value real relationships.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {title}
            </p>
            <ul className="space-y-2 text-sm">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-brand-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-zinc-500">
            <SocialIcon href="#" label="Facebook">
              <Facebook className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="#" label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="#" label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="#" label="YouTube">
              <Youtube className="h-4 w-4" />
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition hover:border-brand-500/40 hover:text-brand-400"
    >
      {children}
    </a>
  );
}
