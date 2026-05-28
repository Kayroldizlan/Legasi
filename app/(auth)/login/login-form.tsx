"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { AuthPasswordInput } from "@/components/auth/auth-password-input";
import { Button, Input } from "@/components/ui";
import { sanitizeNextPath } from "@/lib/auth/routes";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";

import { SocialAuthSection } from "../google-button";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "legasi-remember-me",
        rememberMe ? "true" : "false",
      );
    }

    toast.success("Welcome back");
    router.push(sanitizeNextPath(next));
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Welcome back 👋
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          Login to your {APP_NAME} account and continue building meaningful
          connections.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthPasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-ink-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500/30"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-brand-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          loading={submitting}
          className="w-full shadow-[0_10px_30px_rgb(239_68_68/0.18)]"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Login
        </Button>
      </form>

      <SocialAuthSection googleLabel="Continue with Google" />

      <p className="text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-600 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
