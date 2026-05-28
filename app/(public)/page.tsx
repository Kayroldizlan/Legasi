import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Network,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Avatar, Badge, LinkButton } from "@/components/ui";
import { AUTH_DEFAULT_REDIRECT } from "@/lib/auth/routes";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

import type { Profile } from "@/types/database";

export const revalidate = 60;

type FeaturedProfile = Pick<
  Profile,
  "id" | "username" | "full_name" | "avatar_url" | "occupation" | "company" | "city" | "country" | "is_verified"
>;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(AUTH_DEFAULT_REDIRECT);
  }

  const [{ count: profilesCount }, featuredRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, occupation, company, city, country, is_verified")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const featured = (featuredRes.data ?? []) as FeaturedProfile[];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_30rem_at_50%_-10%,rgb(59_130_246/0.15),transparent_60%)]" />
        <div className="container py-20 md:py-28 text-center">
          <Badge tone="brand" className="mb-5">
            <Sparkles className="h-3 w-3" /> New · Real-time messaging is live
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl md:text-6xl font-semibold tracking-tight text-ink">
            {APP_TAGLINE}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-ink-muted">
            {APP_NAME} is a modern professional directory and networking
            platform. Build rich profiles, visualize real relationships, and
            connect instantly.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <LinkButton href="/register" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Get started — it's free
            </LinkButton>
            <LinkButton href="/directory" size="lg" variant="secondary">
              Browse directory
            </LinkButton>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 text-center">
            <Stat label="Members" value={profilesCount ?? 0} />
            <Stat label="Connections" value={"∞"} />
            <Stat label="Relationship types" value={10} />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="container py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-3">
            <Feature
              icon={UsersRound}
              title="Rich, beautiful profiles"
              text="Showcase your work, business, social links, and location with a profile page that's a joy to share."
            />
            <Feature
              icon={Network}
              title="Visualize relationships"
              text="Interactive React Flow graphs make family trees and org charts come alive."
            />
            <Feature
              icon={MessageCircle}
              title="Real-time messaging"
              text="Chat instantly with typing indicators, read receipts, and online status powered by Supabase Realtime."
            />
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container py-16 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Newest members
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Say hello to the latest people who joined ConnectDirectory.
              </p>
            </div>
            <Link
              href="/directory"
              className="hidden md:inline-flex items-center text-sm font-medium text-brand-600 hover:underline"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/u/${p.username}`}
                className="card p-5 hover:shadow-elevated hover:-translate-y-0.5 transition group"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={p.avatar_url} name={p.full_name} size={48} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold flex items-center gap-1">
                      {p.full_name}
                      {p.is_verified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                      )}
                    </p>
                    <p className="truncate text-xs text-ink-subtle">
                      @{p.username}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-1 text-xs text-ink-muted">
                  {p.occupation && <p className="truncate">{p.occupation}</p>}
                  {p.company && <p className="truncate">{p.company}</p>}
                  {(p.city || p.country) && (
                    <p className="truncate text-ink-subtle">
                      {[p.city, p.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="container py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Bring your network somewhere it can grow.
            </h2>
            <p className="mt-3 text-white/80 max-w-md">
              Whether it's an alumni community, a family tree, or a company
              org chart — {APP_NAME} adapts to how your people connect.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/register" size="lg" className="bg-white text-brand-700 hover:bg-white/90">
                Start your profile
              </LinkButton>
              <LinkButton href="/about" size="lg" variant="ghost" className="text-white hover:bg-white/10">
                Learn more
              </LinkButton>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              "Email & Google sign-in",
              "Realtime direct messages",
              "QR code profile sharing",
              "Connection requests",
              "Family tree visualization",
              "Org chart visualization",
              "Verified profile badges",
              "Modern admin panel",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur"
              >
                <ShieldCheck className="h-4 w-4 text-white/90" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-2xl md:text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-subtle">{label}</p>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof UsersRound;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-start">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-muted">{text}</p>
    </div>
  );
}
