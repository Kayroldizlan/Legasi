"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

const COMMUNITIES = [
  {
    title: "Family Networks",
    members: "3,200+ Members",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Alumni Groups",
    members: "2,800+ Members",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Professional Teams",
    members: "1,900+ Members",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Community Orgs",
    members: "2,100+ Members",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
  },
] as const;

export function CommunitiesCarousel() {
  const trackRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.85;
    track.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#050505] to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#050505] to-transparent sm:w-16" />

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {COMMUNITIES.map((community) => (
          <article
            key={community.title}
            className="relative min-w-[280px] snap-start overflow-hidden rounded-3xl border border-white/10 sm:min-w-[320px] lg:min-w-[360px]"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={community.image}
                alt={community.title}
                fill
                sizes="360px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-lg font-semibold text-white">
                  {community.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-300">{community.members}</p>
                <div className="mt-4 flex -space-x-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 overflow-hidden rounded-full border-2 border-black bg-zinc-800"
                    >
                      <Image
                        src={`https://ui-avatars.com/api/?name=${community.title}+${i}&background=7f1d1d&color=fff&size=64`}
                        alt=""
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <CarouselButton label="Previous communities" onClick={() => scroll("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </CarouselButton>
        <CarouselButton label="Next communities" onClick={() => scroll("next")}>
          <ChevronRight className="h-4 w-4" />
        </CarouselButton>
      </div>
    </div>
  );
}

function CarouselButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15",
        "bg-white/5 text-white transition hover:border-brand-500/50 hover:bg-brand-500/10",
      )}
    >
      {children}
    </button>
  );
}
