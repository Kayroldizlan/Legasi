import { z } from "zod";

/**
 * Accepts an optional URL with or without an explicit protocol.
 *
 * - `""` and `undefined` are allowed (the field is optional).
 * - `example.com` and `https://example.com` both pass.
 *
 * This avoids the common "Save did nothing" trap where Zod's strict
 * `.url()` silently rejected inputs that users typed without typing the
 * `https://` prefix.
 */
const lenientUrlField = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => {
      if (!v) return true;
      const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`;
      try {
        new URL(candidate);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Enter a valid URL." },
  );

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
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters.")
    .max(24, "Username must be at most 24 characters.")
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores."),
  occupation: z.string().max(120).optional().or(z.literal("")),
  company: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  phone: z.string().max(32).optional().or(z.literal("")),
  website: lenientUrlField,
  address: z.string().max(180).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const socialLinksSchema = z.object({
  facebook: lenientUrlField,
  instagram: lenientUrlField,
  tiktok: lenientUrlField,
  linkedin: lenientUrlField,
  whatsapp: z.string().optional().or(z.literal("")),
  twitter: lenientUrlField,
});
export type SocialLinksInput = z.infer<typeof socialLinksSchema>;

/**
 * Auto-prefix `https://` to a value when the user typed a bare domain.
 * Returns null when the value is empty/whitespace, so callers can store
 * NULL in the database rather than empty strings.
 */
export function normalizeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function cleanOptionalString(value: string | undefined | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Normalize profile form values for DB storage (trim, lowercase username, null blanks). */
export function normalizeProfileInput(input: ProfileInput) {
  return {
    full_name: input.full_name.trim(),
    username: input.username.toLowerCase().trim(),
    occupation: cleanOptionalString(input.occupation),
    company: cleanOptionalString(input.company),
    bio: cleanOptionalString(input.bio),
    phone: cleanOptionalString(input.phone),
    website: normalizeUrl(input.website),
    address: cleanOptionalString(input.address),
    city: cleanOptionalString(input.city),
    country: cleanOptionalString(input.country),
  };
}

export type NormalizedProfileInput = ReturnType<typeof normalizeProfileInput>;

export const messageSchema = z.object({
  message: z.string().min(1, "Type something").max(2000),
});
export type MessageInput = z.infer<typeof messageSchema>;
