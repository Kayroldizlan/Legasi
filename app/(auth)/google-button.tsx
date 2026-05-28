"use client";

import * as React from "react";
import toast from "react-hot-toast";

import { AUTH_DEFAULT_REDIRECT } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = React.useState(false);

  const handle = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(AUTH_DEFAULT_REDIRECT)}`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <SocialAuthButton onClick={handle} loading={loading} label={label}>
      <GoogleIcon className="h-4 w-4" />
    </SocialAuthButton>
  );
}

export function FacebookAuthButton() {
  return (
    <SocialAuthButton
      label="Continue with Facebook"
      onClick={() => toast("Facebook sign-in coming soon.")}
    >
      <FacebookIcon className="h-4 w-4" />
    </SocialAuthButton>
  );
}

export function AppleAuthButton() {
  return (
    <SocialAuthButton
      label="Continue with Apple"
      onClick={() => toast("Apple sign-in coming soon.")}
    >
      <AppleIcon className="h-4 w-4" />
    </SocialAuthButton>
  );
}

function SocialAuthButton({
  label,
  onClick,
  loading,
  children,
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-ink transition",
        "hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-brand-600" />
      ) : (
        children
      )}
      {label}
    </button>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props} aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.8-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.5-4.9 9.5-7.4 0-.5 0-.9-.1-1.3H12z"
      />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" {...props} aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.018 1.792-4.687 4.533-4.687 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props} aria-hidden>
      <path d="M16.365 1.43c0 1.14-.467 2.226-1.177 3.032-.788.89-2.032 1.575-3.192 1.48-.14-1.086.493-2.248 1.213-3.034C14.016 2.13 15.32 1.445 16.365 1.43zm4.32 16.133c-.786 1.812-1.155 2.632-2.158 4.248-1.4 2.205-3.374 4.957-5.822 4.98-2.103.02-2.646-1.366-5.5-1.35-2.855.016-3.455 1.374-5.558 1.354-2.448-.023-4.308-2.512-5.708-4.716C1.18 18.92-.304 13.906 1.64 9.982 3.073 7.203 5.659 5.445 8.865 5.424c2.127-.022 4.135 1.455 5.435 1.455 1.276 0 3.666-1.798 6.183-1.532 1.053.044 4.008.426 5.902 3.205-.155.096-3.524 2.06-3.493 6.145.034 4.878 4.268 6.504 4.318 6.524-.034.098-.676 2.312-2.485 4.832z" />
    </svg>
  );
}

export function SocialAuthSection({
  googleLabel = "Continue with Google",
}: {
  googleLabel?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="relative flex items-center">
        <span className="h-px flex-1 bg-zinc-200" />
        <span className="mx-3 text-xs text-ink-subtle">or continue with</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>
      <GoogleButton label={googleLabel} />
      <FacebookAuthButton />
      <AppleAuthButton />
    </div>
  );
}
