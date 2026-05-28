import { PublicNavbar } from "@/components/layout/public-navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Footer is intentionally only rendered on the home page — see
  // `app/(public)/page.tsx`. Keeping the rest of the public surfaces
  // (directory, search, about, public profile, network…) footer-free
  // gives them more focus and avoids a tall always-visible chrome.
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
