import type { Metadata } from "next";

import { LinkButton } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${APP_NAME} — a modern directory and networking platform.`,
};

export default function AboutPage() {
  return (
    <div className="container py-16 md:py-24 max-w-3xl">
      <span className="inline-block rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 px-3 py-1 text-xs font-medium">
        About
      </span>
      <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
        Built for real human networks.
      </h1>
      <p className="mt-4 text-base md:text-lg text-ink-muted leading-relaxed">
        {APP_NAME} is a SaaS-quality starter that helps communities, families,
        teams, and alumni groups stay connected. It blends a clean public
        directory, a profile system, real-time messaging, and an interactive
        relationship graph into one production-ready application.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Block title="Profiles that feel professional">
          Every profile includes occupation, business, social handles, and a
          shareable QR code so members can find each other anywhere.
        </Block>
        <Block title="Relationships you can see">
          We use React Flow to render family trees and org charts so members
          can navigate the network visually.
        </Block>
        <Block title="Realtime conversations">
          Messages, typing indicators, and read receipts use Supabase Realtime
          with row-level security baked in.
        </Block>
        <Block title="A serious admin panel">
          Manage users, relationships, banners, and moderation from a clean
          admin dashboard.
        </Block>
      </div>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white">
        <h2 className="text-2xl font-semibold">Made with a modern stack</h2>
        <p className="mt-2 text-white/80">
          Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase ·
          Supabase Realtime · React Flow · Zustand
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/register" className="bg-white text-brand-700 hover:bg-white/90">
            Create your profile
          </LinkButton>
          <LinkButton href="/directory" variant="ghost" className="text-white hover:bg-white/10">
            Explore the directory
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-muted leading-relaxed">{children}</p>
    </div>
  );
}
