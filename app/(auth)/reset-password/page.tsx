"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. Please sign in.");
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="text-sm text-ink-muted">
          Choose a strong password you don't use elsewhere.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirm?.message}
          {...register("confirm")}
        />
        <Button type="submit" loading={submitting} className="w-full">
          Update password
        </Button>
      </form>
    </div>
  );
}
