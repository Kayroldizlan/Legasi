import {
  ArrowRight,
  BarChart3,
  Compass,
  Globe2,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Network,
  Play,
  QrCode,
  Shield,
  Sparkles,
  Star,
  TreePine,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { AboutFooter } from "@/components/about/about-footer";
import { CommunitiesCarousel } from "@/components/about/communities-carousel";
import { NetworkGlobe } from "@/components/about/network-globe";
import { Avatar, LinkButton } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${APP_NAME} — preserving connections across generations.`,
};

const VALUE_CARDS = [
  {
    icon: Heart,
    title: "Preserve",
    text: "Keep family stories, professional ties, and community bonds alive in one trusted place.",
  },
  {
    icon: Compass,
    title: "Discover",
    text: "Find the right people through rich profiles, visual relationships, and smart directory search.",
  },
  {
    icon: BarChart3,
    title: "Grow",
    text: "Expand your network with connection requests, messaging, and shareable profile QR codes.",
  },
] as const;

const JOURNEY = [
  {
    icon: TreePine,
    title: "The Past",
    text: "Connections lived in photo albums, phone books, and scattered group chats.",
  },
  {
    icon: UsersRound,
    title: "The Present",
    text: "Legasi brings profiles, relationships, and conversations into one living directory.",
  },
  {
    icon: Sparkles,
    title: "The Future",
    text: "A digital legacy that grows with every generation — searchable, visual, and secure.",
  },
] as const;

const FEATURES = [
  {
    icon: Globe2,
    title: "Rich member profiles",
    text: "Occupation, company, location, social links, and QR sharing on every public page.",
  },
  {
    icon: Network,
    title: "Visual relationship maps",
    text: "Explore family trees, org charts, and mentor networks with interactive graphs.",
  },
  {
    icon: MessageCircle,
    title: "Realtime messaging",
    text: "Direct chat with typing indicators, read receipts, and online presence.",
  },
  {
    icon: QrCode,
    title: "QR profile sharing",
    text: "Share your profile instantly at events, reunions, and meetups.",
  },
  {
    icon: Shield,
    title: "Secure by design",
    text: "Row-level security, verified badges, and moderation tools keep networks safe.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin dashboard",
    text: "Manage users, relationships, banners, and analytics from one panel.",
  },
] as const;

const VISION_POINTS = [
  { icon: TreePine, title: "Built for generations" },
  { icon: Shield, title: "Privacy first" },
  { icon: Heart, title: "Made with heart" },
] as const;

function formatStat(value: number, suffix = "+") {
  if (value <= 0) return "0";
  if (value >= 1000) {
    const formatted =
      value >= 10000
        ? `${Math.round(value / 1000)}k`
        : `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return `${formatted}${suffix}`;
  }
  return `${value}${suffix}`;
}

export default async function AboutPage() {
  const supabase = await createClient();

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
  const featured = featuredRes.data ?? [];

  const stats = [
    {
      icon: UsersRound,
      value: membersCount > 0 ? formatStat(membersCount) : "100+",
      label: "Active members",
    },
    {
      icon: Network,
      value: connectionsCount > 0 ? formatStat(connectionsCount) : "50+",
      label: "Connections made",
    },
    { icon: Globe2, value: "50+", label: "Countries represented" },
    { icon: Star, value: "98%", label: "Member satisfaction" },
  ] as const;

  return (
    <div className="bg-[#050505] text-zinc-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(50rem_40rem_at_15%_-10%,rgb(239_68_68/0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40rem_30rem_at_90%_10%,rgb(239_68_68/0.08),transparent_50%)]" />
        <div className="container relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
              About {APP_NAME}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              Preserving{" "}
              <span className="text-brand-500">Connections</span> Across
              Generations
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
              {APP_NAME} is a modern directory and networking platform for
              families, alumni groups, teams, and communities who want their
              relationships to last — not disappear into chats and spreadsheets.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton
                href="/register"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="shadow-[0_0_30px_rgb(239_68_68/0.25)]"
              >
                Start your legacy
              </LinkButton>
              <LinkButton
                href="/directory"
                size="lg"
                variant="outline"
                leftIcon={<Play className="h-4 w-4" />}
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Watch demo
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
                  {membersCount > 0 ? formatStat(membersCount) : "100+"}
                </span>{" "}
                active members
              </p>
            </div>
          </div>

          <NetworkGlobe />
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080808]">
        <div className="container grid gap-5 py-14 md:grid-cols-3 md:py-20">
          {VALUE_CARDS.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-[0_0_40px_rgb(239_68_68/0.04)_inset] md:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 shadow-[0_0_24px_rgb(239_68_68/0.15)]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Our <span className="text-brand-500">Journey</span> Through Time
          </h2>
          <p className="mt-3 text-sm text-zinc-400 md:text-base">
            From scattered contacts to a connected legacy — how {APP_NAME}{" "}
            helps networks evolve.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            {JOURNEY.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="relative flex gap-4 pl-8">
                {index < JOURNEY.length - 1 && (
                  <span className="absolute left-[15px] top-10 h-[calc(100%+1rem)] w-px bg-gradient-to-b from-brand-500/60 to-white/10" />
                )}
                <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border border-brand-500/40 bg-brand-500/10 text-brand-500">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <div className="relative aspect-[16/10]">
              <Image
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
                alt="People connected across generations"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080808]">
        <div className="container grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4 md:py-20">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-brand-500 md:text-4xl">
                {value}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            What you can do
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Powerful features for meaningful connections
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="flex gap-4 rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 transition hover:border-brand-500/30 md:p-7"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080808]">
        <div className="container py-16 md:py-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Our Thriving <span className="text-brand-500">Communities</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                From family reunions to professional teams — see how different
                groups use {APP_NAME} to stay connected.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <CommunitiesCarousel />
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0a]">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-[320px] border-b border-white/10 lg:min-h-[420px] lg:border-b-0 lg:border-r">
              <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80"
                alt="Founder portrait"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-[#0a0a0a] lg:bg-gradient-to-t lg:from-[#0a0a0a] lg:via-black/20 lg:to-transparent" />
              <div className="absolute inset-0 hidden items-center justify-center lg:flex">
                <div className="h-56 w-56 rounded-full border border-brand-500/40 shadow-[0_0_60px_rgb(239_68_68/0.25)]" />
              </div>
            </div>

            <div className="grid gap-8 p-8 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                  Our vision
                </p>
                <blockquote className="mt-4 text-2xl font-semibold leading-snug text-white md:text-3xl">
                  &ldquo;We believe every relationship deserves to be
                  remembered.&rdquo;
                </blockquote>
                <p className="mt-6 text-sm font-medium text-white">
                  The {APP_NAME} Team
                </p>
                <p className="text-xs text-zinc-500">Founders & builders</p>
              </div>

              <ul className="space-y-4">
                {VISION_POINTS.map(({ icon: Icon, title }) => (
                  <li
                    key={title}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-200">
                      {title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(50rem_12rem_at_50%_100%,rgb(239_68_68/0.35),transparent_70%)]" />
        <div className="container relative py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
            Ready to Build Your Digital Legacy?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 md:text-base">
            Create your profile, map your relationships, and start connecting
            with the people who shape your story.
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
              href="/directory"
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              Explore directory
            </LinkButton>
          </div>
        </div>
      </section>

      <AboutFooter />
    </div>
  );
}
