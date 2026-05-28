import type { RelationType } from "@/types/database";

export const APP_NAME = "Legasi";
/** Wordmark shown beside the logo mark in the header/sidebar. */
export const LOGO_WORDMARK = "The Legasi";
export const APP_TAGLINE = "Where professionals connect, collaborate, and grow.";

/** 13 states + Wilayah Persekutuan (Malaysia). */
export const MALAYSIAN_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Wilayah Persekutuan",
] as const;

export type MalaysianState = (typeof MALAYSIAN_STATES)[number];

export const RELATION_TYPES: RelationType[] = [
  "sibling",
  "parent",
  "child",
  "cousin",
  "spouse",
  "business_partner",
  "employee",
  "manager",
  "friend",
  "mentor",
];

export const RELATION_META: Record<
  RelationType,
  { label: string; color: string; group: "family" | "work" | "social" }
> = {
  parent:           { label: "Parent",           color: "#1d4ed8", group: "family" },
  child:            { label: "Child",            color: "#0ea5e9", group: "family" },
  sibling:          { label: "Sibling",          color: "#2563eb", group: "family" },
  cousin:           { label: "Cousin",           color: "#7c3aed", group: "family" },
  spouse:           { label: "Spouse",           color: "#db2777", group: "family" },
  business_partner: { label: "Business Partner", color: "#d97706", group: "work" },
  employee:         { label: "Employee",         color: "#16a34a", group: "work" },
  manager:          { label: "Manager",          color: "#f97316", group: "work" },
  friend:           { label: "Friend",           color: "#10b981", group: "social" },
  mentor:           { label: "Mentor",           color: "#8b5cf6", group: "social" },
};

export const PROFILE_PAGE_SIZE = 12;

export const NAV_LINKS_PUBLIC = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/about", label: "About" },
];

export const NAV_LINKS_PRIVATE = [
  { href: "/dashboard",     label: "Dashboard",     icon: "LayoutDashboard" },
  { href: "/directory",     label: "Directory",     icon: "Users" },
  { href: "/connections",   label: "Connections",   icon: "UserPlus" },
  { href: "/messages",      label: "Messages",      icon: "MessageSquare" },
  { href: "/notifications", label: "Notifications", icon: "Bell" },
  { href: "/settings",      label: "Settings",      icon: "Settings" },
];

export const NAV_LINKS_ADMIN = [
  { href: "/admin",                label: "Overview",   icon: "LayoutDashboard" },
  { href: "/admin/users",          label: "Users",      icon: "Users" },
  { href: "/admin/relations",      label: "Relations",  icon: "Network" },
  { href: "/admin/messages",       label: "Messages",   icon: "MessageSquare" },
  { href: "/admin/banners",        label: "Banners",    icon: "Image" },
  { href: "/admin/analytics",      label: "Analytics",  icon: "BarChart3" },
  { href: "/admin/activity",       label: "Activity",   icon: "Activity" },
];
