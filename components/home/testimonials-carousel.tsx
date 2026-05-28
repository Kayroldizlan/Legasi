"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    location: "Kuala Lumpur",
    quote:
      "Legasi helped our alumni group stay connected across three continents. The relationship map is incredible.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Ahmad Razif",
    location: "Penang",
    quote:
      "We mapped our family tree in days. Every cousin, every branch — visible and searchable in one place.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Priya Nair",
    location: "Johor Bahru",
    quote:
      "Our business network finally has structure. Profiles, messaging, and connections that actually make sense.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Daniel Wong",
    location: "Singapore",
    quote:
      "The QR profile sharing alone changed how we meet people at events. Professional and effortless.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
] as const;

export function TestimonialsCarousel() {
  const trackRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction === "next" ? track.clientWidth * 0.9 : -track.clientWidth * 0.9,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TESTIMONIALS.map((item) => (
          <article
            key={item.name}
            className="min-w-[300px] snap-start rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md sm:min-w-[360px]"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/15">
                <Image
                  src={item.avatar}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-xs text-zinc-500">{item.location}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              &ldquo;{item.quote}&rdquo;
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <CarouselButton label="Previous testimonial" onClick={() => scroll("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </CarouselButton>
        <CarouselButton label="Next testimonial" onClick={() => scroll("next")}>
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
