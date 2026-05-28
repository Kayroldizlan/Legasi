import Image from "next/image";
import Link from "next/link";
import { Heart, Shield, Sparkles, UsersRound } from "lucide-react";

import { Logo } from "@/components/layout/logo";

const FEATURES = [
  {
    icon: UsersRound,
    title: "Connect",
    text: "Find and stay close to the people who matter in your network.",
  },
  {
    icon: Shield,
    title: "Preserve",
    text: "Keep relationships, stories, and profiles safe for generations.",
  },
  {
    icon: Sparkles,
    title: "Grow",
    text: "Expand your community with messaging, QR sharing, and discovery.",
  },
  {
    icon: Heart,
    title: "Inspire",
    text: "Build a digital legacy your family and team can be proud of.",
  },
] as const;

export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
      <Image
        src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80"
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-brand-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(239_68_68/0.25),transparent_45%)]" />

      <div className="relative z-10 p-10 xl:p-12">
        <Logo href="/" inverted />
      </div>

      <div className="relative z-10 max-w-lg space-y-8 px-10 pb-10 xl:px-12 xl:pb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur">
          🇲🇾 Malaysia&apos;s digital legacy platform
        </span>
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
            Every connection has a{" "}
            <span className="text-brand-400">legacy.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-base">
            Join families, alumni groups, and professional communities building
            meaningful relationships that last beyond a single chat thread.
          </p>
        </div>

        <ul className="space-y-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/65">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 px-10 pb-8 text-xs text-white/50 xl:px-12">
        © {new Date().getFullYear()} The Legasi ·{" "}
        <Link href="/" className="underline hover:text-white/80">
          Back to home
        </Link>
      </p>
    </div>
  );
}
