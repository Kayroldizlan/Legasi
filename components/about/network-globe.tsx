import Image from "next/image";

import { cn } from "@/lib/utils";

const NODES = [
  { x: 50, y: 12, r: 14 },
  { x: 82, y: 28, r: 11 },
  { x: 88, y: 58, r: 12 },
  { x: 68, y: 82, r: 10 },
  { x: 32, y: 86, r: 11 },
  { x: 12, y: 62, r: 10 },
  { x: 18, y: 32, r: 12 },
  { x: 38, y: 22, r: 9 },
  { x: 72, y: 48, r: 10 },
  { x: 28, y: 52, r: 9 },
] as const;

const EDGES: [number, number][] = [
  [0, 1],
  [0, 7],
  [1, 8],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 9],
  [9, 5],
  [8, 3],
  [9, 0],
  [8, 4],
];

interface NetworkGlobeProps {
  className?: string;
}

export function NetworkGlobe({ className }: NetworkGlobeProps) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[520px]",
        className,
      )}
    >
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_40%,rgb(239_68_68/0.22),transparent_62%)] blur-2xl" />
      <div className="absolute inset-[12%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgb(255_255_255/0.06),rgb(0_0_0/0.85)_70%)] shadow-[0_0_80px_rgb(239_68_68/0.15)_inset]" />

      <svg
        viewBox="0 0 100 100"
        className="absolute inset-[12%] h-[76%] w-[76%] text-brand-500/70"
        aria-hidden
      >
        {EDGES.map(([a, b], i) => {
          const n1 = NODES[a];
          const n2 = NODES[b];
          return (
            <line
              key={i}
              x1={n1.x}
              y1={n1.y}
              x2={n2.x}
              y2={n2.y}
              stroke="currentColor"
              strokeWidth="0.35"
              strokeOpacity="0.55"
            />
          );
        })}
        {NODES.map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={node.r * 0.22}
            fill="rgb(239 68 68 / 0.35)"
            stroke="rgb(239 68 68 / 0.8)"
            strokeWidth="0.35"
          />
        ))}
      </svg>

      {NODES.slice(0, 6).map((node, i) => (
        <div
          key={i}
          className="absolute h-8 w-8 overflow-hidden rounded-full border border-brand-500/40 bg-zinc-800 shadow-[0_0_16px_rgb(239_68_68/0.35)] sm:h-10 sm:w-10"
          style={{
            left: `${12 + node.x * 0.76}%`,
            top: `${12 + node.y * 0.76}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Image
            src={`https://ui-avatars.com/api/?name=Member+${i + 1}&background=991b1b&color=fff&size=80`}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-brand-500/50 bg-black/70 shadow-[0_0_40px_rgb(239_68_68/0.45)] sm:h-20 sm:w-20">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(239_68_68/0.35),transparent_70%)]" />
        <Image
          src="/logo-mark.png"
          alt=""
          width={40}
          height={40}
          className="relative h-9 w-9 object-contain sm:h-11 sm:w-11"
        />
      </div>
    </div>
  );
}
