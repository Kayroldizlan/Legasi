import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-white overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <Logo
          href="/"
          variant="full"
          inverted
          className="relative z-10"
        />
        <div className="relative z-10 max-w-md space-y-6">
          <h2 className="text-3xl font-semibold leading-tight">
            Build your professional network with people you actually know.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            {APP_NAME} helps communities, alumni networks, and teams stay
            connected with rich profiles, real relationships, and instant
            messaging.
          </p>
          <ul className="space-y-3 text-sm text-white/80">
            {[
              "Real-time direct messaging",
              "Interactive relationship hierarchy",
              "Powerful directory with filters and search",
              "Modern admin dashboard",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-white/70">
          © {new Date().getFullYear()} {APP_NAME} ·{" "}
          <Link href="/" className="underline">
            Back to home
          </Link>
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
