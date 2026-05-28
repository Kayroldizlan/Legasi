"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, AtSign, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { AuthPasswordInput } from "@/components/auth/auth-password-input";
import { Button, Input } from "@/components/ui";
import { AUTH_DEFAULT_REDIRECT } from "@/lib/auth/routes";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations";

import { SocialAuthSection } from "../google-button";

export function RegisterForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(AUTH_DEFAULT_REDIRECT)}`,
        data: {
          full_name: values.full_name,
          username: values.username.toLowerCase(),
        },
      },
    });

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Check your email to confirm your account");
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Create your account 👋
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          Join {APP_NAME} and start building your digital legacy with profiles,
          connections, and community.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          placeholder="Your full name"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.full_name?.message}
          {...register("full_name")}
        />
        <Input
          label="Username"
          leftIcon={<AtSign className="h-4 w-4" />}
          placeholder="janedoe"
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthPasswordInput
          label="Password"
          placeholder="Create a password"
          error={errors.password?.message}
          {...register("password")}
        />
        <AuthPasswordInput
          label="Confirm password"
          placeholder="Confirm your password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />

        <Button
          type="submit"
          loading={submitting}
          className="w-full shadow-[0_10px_30px_rgb(239_68_68/0.18)]"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Create account
        </Button>

        <p className="text-center text-xs leading-relaxed text-ink-subtle">
          By creating an account, you agree to our terms and privacy policy.
        </p>
      </form>

      <SocialAuthSection googleLabel="Sign up with Google" />

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
