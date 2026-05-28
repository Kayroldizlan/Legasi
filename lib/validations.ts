import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Full name is required."),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(24, "Username must be at most 24 characters.")
      .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores."),
    email: z.string().email("Enter a valid email."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(2, "Full name is required."),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores."),
  occupation: z.string().max(120).optional().or(z.literal("")),
  company: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  phone: z.string().max(32).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().max(180).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const socialLinksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
});
export type SocialLinksInput = z.infer<typeof socialLinksSchema>;

export const messageSchema = z.object({
  message: z.string().min(1, "Type something").max(2000),
});
export type MessageInput = z.infer<typeof messageSchema>;
