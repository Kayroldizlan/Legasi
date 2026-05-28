import { Home } from "lucide-react";

import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-semibold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <LinkButton href="/" className="mt-6">
          <Home className="h-4 w-4" /> Back home
        </LinkButton>
      </div>
    </div>
  );
}
