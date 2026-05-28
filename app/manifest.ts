import type { MetadataRoute } from "next";

import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512] as const;

  return {
    name: APP_NAME,
    short_name: "ConnectDir",
    description: APP_TAGLINE,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8fafc",
    theme_color: "#dc2626",
    categories: ["business", "social", "productivity"],
    icons: [
      ...iconSizes.map((size) => ({
        src: `/icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png" as const,
        purpose: "any" as const,
      })),
      ...([192, 512] as const).map((size) => ({
        src: `/icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png" as const,
        purpose: "maskable" as const,
      })),
    ],
    screenshots: [
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        form_factor: "narrow",
        label: APP_NAME,
      },
    ],
    shortcuts: [
      {
        name: "Directory",
        short_name: "Directory",
        url: "/directory",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Messages",
        short_name: "Messages",
        url: "/messages",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
