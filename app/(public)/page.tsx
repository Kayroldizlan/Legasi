import {
  ArrowRight,
  Calendar,
  Globe2,
  Heart,
  MessageCircle,
  Network,
  Play,
  QrCode,
  Search,
  Shield,
  Sparkles,
  Star,
  TreePine,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { AboutFooter } from "@/components/about/about-footer";
import { CommunitiesCarousel } from "@/components/about/communities-carousel";
import { NetworkGlobe } from "@/components/about/network-globe";
import { FloatingPreviewCards } from "@/components/home/floating-preview-cards";
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel";
import { Avatar, LinkButton } from "@/components/ui";
import { AUTH_DEFAULT_REDIRECT } from "@/lib/auth/routes";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

import type { Profile } from "@/types/database";

export const revalidate = 60;

type FeaturedProfile = Pick<
  Profile,
  "avatar_url" | "full_name"
>;

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Real-time messaging",
    text: "Direct chat with typing indicators, read receipts, and online presence.",
  },
  {
    icon: UsersRound,
    title: "Digital profiles",
    text: "Rich public pages with work, location, social links, and shareable QR codes.",
  },
  {
    icon: Network,
    title: "Communities",
    text: "Organize family networks, alumni groups, and professional teams in one directory.",
  },
  {
    icon: Calendar,
    title: "Relationship events",
    text: "Track connections, requests, and network growth as your community expands.",
  },
  {
    icon: QrCode,
    title: "QR networking",
    text: "Share your profile instantly at reunions, conferences, and meetups.",
  },
  {
    icon: Search,
    title: "Smart search",
    text: "Find people by name, occupation, company, city, and Malaysian state filters.",
  },
] as const;

const LEGACY_ORBIT = [
  { icon: Heart, label: "Preserve memories" },
  { icon: UsersRound, label: "Grow communities" },
  { icon: TreePine, label: "Map family trees" },
  { icon: Shield, label: "Stay secure" },
] as const;

function formatStat(value: number, suffix = "+") {
  if (value <= 0) return "100+";
  if (value >= 1000) {
    const formatted =
      value >= 10000
        ? `${Math.round(value / 1000)}k`
        : `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return `${formatted}${suffix}`;
  }
  return `${value}${suffix}`;
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(AUTH_DEFAULT_REDIRECT);
  }

  const [membersRes, connectionsRes, featuredRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted"),
    supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const membersCount = membersRes.count ?? 0;
  const connectionsCount = connectionsRes.count ?? 0;
  const featured = (featuredRes.data ?? []) as FeaturedProfile[];

  const stats = [
    { icon: UsersRound, value: formatStat(membersCount), label: "Active members" },
    { icon: Network, value: "500+", label: "Communities" },
    { icon: TreePine, value: "120+", label: "Family networks" },
    { icon: Globe2, value: "50+", label: "Countries" },
    {
      icon: Sparkles,
      value: connectionsCount > 0 ? formatStat(connectionsCount) : "1k+",
      label: "Connections",
    },
  ] as const;

  return (
    <div className="bg-[#050505] text-zinc-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(50rem_40rem_at_50%_0%,rgb(239_68_68/0.16),transparent_55%)]" />
        <div className="container relative py-16 md:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                {APP_NAME} Connect Directory
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tight md:text-5xl lg:text-6xl">
                Connect Today.{" "}
                <span className="text-brand-500">Legacy</span> Forever.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
                Build meaningful relationships, preserve your network across
                generations, and grow communities that last — all in one modern
                directory platform.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton
                  href="/register"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="shadow-[0_0_30px_rgb(239_68_68/0.25)]"
                >
                  Join the directory
                </LinkButton>
                <LinkButton
                  href="/directory"
                  size="lg"
                  variant="outline"
                  leftIcon={<Play className="h-4 w-4" />}
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  Explore community
                </LinkButton>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {featured.length > 0
                    ? featured.map((member, i) => (
                        <Avatar
                          key={i}
                          src={member.avatar_url}
                          name={member.full_name}
                          size={36}
                          className="ring-2 ring-[#050505]"
                        />
                      ))
                    : [0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-9 w-9 overflow-hidden rounded-full border-2 border-[#050505] bg-zinc-800"
                        >
                          <Image
                            src={`https://ui-avatars.com/api/?name=Member+${i}&background=991b1b&color=fff&size=72`}
                            alt=""
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                </div>
                <p className="text-sm text-zinc-400">
                  <span className="font-semibold text-white">
                    {formatStat(membersCount)}
                  </span>{" "}
                  members and growing
                </p>
              </div>
            </div>

            <div className="relative">
              <FloatingPreviewCards />
              <NetworkGlobe className="mx-auto max-w-[560px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="container pb-8 md:pb-12">
        <div className="rounded-[1.75rem] border border-brand-500/20 bg-white/[0.03] p-4 backdrop-blur-md md:p-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-5 md:gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-brand-500 md:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            What you can do
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Everything you need in one place
          </h2>
          <p className="mt-3 text-sm text-zinc-400 md:text-base">
            Profiles, messaging, relationships, and discovery — designed for
            networks that outgrow group chats and spreadsheets.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 transition hover:border-brand-500/30 hover:shadow-[0_0_40px_rgb(239_68_68/0.06)] md:p-7"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 shadow-[0_0_20px_rgb(239_68_68/0.12)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Communities */}
      <section className="border-y border-white/10 bg-[#080808]">
        <div className="container py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Explore active <span className="text-brand-500">communities</span>
            </h2>
            <p className="mt-3 text-sm text-zinc-400 md:text-base">
              Family networks, alumni groups, business owners, and more — find
              your people or start a new community on {APP_NAME}.
            </p>
          </div>
          <div className="mt-10">
            <CommunitiesCarousel />
          </div>
        </div>
      </section>

      {/* Legacy / value prop */}
      <section className="container py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
              More than a directory
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Your digital legacy starts here
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
              {APP_NAME} is built to preserve relationships — not just list
              contacts. Map family trees, grow professional networks, and keep
              conversations alive across generations.
            </p>
          </div>

          <div className="relative mx-auto flex aspect-square w-full max-w-[320px] items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-brand-500/20 bg-[radial-gradient(circle,rgb(239_68_68/0.12),transparent_70%)]" />
            <div className="absolute inset-[12%] rounded-full border border-dashed border-white/10" />
            {LEGACY_ORBIT.map(({ icon: Icon, label }, i) => {
              const angle = (i / LEGACY_ORBIT.length) * 360 - 90;
              const radius = 42;
              const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
              const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
              return (
                <div
                  key={label}
                  className="absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-500/30 bg-black/80 text-brand-500 shadow-[0_0_20px_rgb(239_68_68/0.15)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400">
                    {label}
                  </span>
                </div>
              );
            })}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-brand-500/40 bg-black/80 shadow-[0_0_50px_rgb(239_68_68/0.25)]">
              <Heart className="h-10 w-10 text-brand-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=400&q=80",
            ].map((src, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-white/10 bg-[#080808]">
        <div className="container py-16 md:py-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                Testimonials
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Loved by our <span className="text-brand-500">community</span>
              </h2>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="ml-2 text-sm text-zinc-400">4.9 average rating</span>
            </div>
          </div>
          <div className="mt-10">
            <TestimonialsCarousel />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-[#050505]/70" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(50rem_12rem_at_50%_100%,rgb(239_68_68/0.35),transparent_70%)]" />
        </div>
        <div className="container relative py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
            Build connections that last forever
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 md:text-base">
            Join {APP_NAME}, create your profile in minutes, and start mapping
            the relationships that define your story.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton
              href="/register"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="shadow-[0_0_30px_rgb(239_68_68/0.25)]"
            >
              Join {APP_NAME}
            </LinkButton>
            <LinkButton
              href="/about"
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              Learn our story
            </LinkButton>
          </div>
        </div>
      </section>

      <AboutFooter />
    </div>
  );
}
