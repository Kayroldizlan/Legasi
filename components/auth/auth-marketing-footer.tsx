"use client";

import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { Logo } from "@/components/layout/logo";
import { APP_NAME } from "@/lib/constants";

const FOOTER_LINKS = {
  Platform: [
    { href: "/directory", label: "Directory" },
    { href: "/about", label: "About" },
    { href: "/register", label: "Sign up" },
  ],
  Company: [
    { href: "/about", label: "Our story" },
    { href: "/about", label: "Privacy" },
    { href: "/about", label: "Terms" },
  ],
  Support: [
    { href: "/about", label: "Help center" },
    { href: "/about", label: "Contact" },
    { href: "/about", label: "FAQ" },
  ],
} as const;

export function AuthMarketingFooter() {
  return (
    <footer className="bg-[#050505] text-zinc-300">
      <div className="container grid gap-10 py-14 lg:grid-cols-[1.1fr_repeat(3,0.8fr)_1.1fr]">
        <div className="space-y-4">
          <Logo inverted />
          <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
            {APP_NAME} Connect Directory — preserving relationships across
            generations with profiles, messaging, and visual networks.
          </p>
          <div className="flex items-center gap-2">
            {[Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition hover:border-brand-500/40 hover:text-brand-400"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
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

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Stay updated
          </p>
          <p className="text-sm text-zinc-500">
            Get product updates and community highlights in your inbox.
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Thanks — newsletter coming soon.");
            }}
          >
            <input
              type="email"
              placeholder="Email address"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-5 text-center text-xs text-zinc-600 sm:text-left">
          © {new Date().getFullYear()} {APP_NAME} Connect Directory. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
