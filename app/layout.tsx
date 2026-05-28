import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { InstallPrompt } from "@/components/pwa/install-prompt";
import { SwRegister } from "@/components/pwa/sw-register";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "A modern directory and networking platform. Build your profile, grow your network, and visualize your relationships.",
  applicationName: APP_NAME,
  keywords: [
    "directory", "networking", "social", "profiles", "Supabase", "Next.js",
  ],
  openGraph: {
    title: APP_NAME,
    description: APP_TAGLINE,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: APP_NAME },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dc2626" },
    { media: "(prefers-color-scheme: dark)", color: "#7f1d1d" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      ).data
    : null;

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider>
          <AuthProvider initialProfile={profile}>
            {children}
            <ToastProvider />
            <InstallPrompt />
          </AuthProvider>
          <SwRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
