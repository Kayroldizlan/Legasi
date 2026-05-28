import type { NotificationType } from "@/types/database";

export type NotificationCategory =
  | "all"
  | "social"
  | "messages"
  | "community"
  | "business"
  | "system";

export const NOTIFICATION_CATEGORIES: {
  id: NotificationCategory;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "social", label: "Social" },
  { id: "messages", label: "Messages" },
  { id: "community", label: "Community" },
  { id: "business", label: "Business" },
  { id: "system", label: "System" },
];

export const NOTIFICATION_CATEGORY_MAP: Record<
  NotificationType,
  NotificationCategory
> = {
  connection_request: "social",
  connection_accepted: "social",
  new_follower: "social",
  profile_view: "social",
  new_message: "messages",
  mention: "messages",
  reply: "messages",
  community_invite: "community",
  community_event: "community",
  community_announcement: "community",
  business_inquiry: "business",
  partnership_request: "business",
  verification_approved: "system",
  admin_notice: "system",
  security_alert: "system",
  system: "system",
};

/** Types that should trigger an in-app toast when received live. */
export const TOAST_NOTIFICATION_TYPES = new Set<NotificationType>([
  "connection_accepted",
  "new_message",
  "connection_request",
  "security_alert",
  "verification_approved",
  "admin_notice",
]);

export const DEFAULT_NOTIFICATION_TYPE_SETTINGS: Record<NotificationType, boolean> =
  {
    connection_request: true,
    connection_accepted: true,
    new_follower: true,
    profile_view: true,
    new_message: true,
    mention: true,
    reply: true,
    community_invite: true,
    community_event: true,
    community_announcement: true,
    business_inquiry: true,
    partnership_request: true,
    verification_approved: true,
    admin_notice: true,
    security_alert: true,
    system: true,
  };

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  connection_request: "Connection requests",
  connection_accepted: "Connection accepted",
  new_follower: "New followers",
  profile_view: "Profile views",
  new_message: "Direct messages",
  mention: "Mentions",
  reply: "Replies",
  community_invite: "Community invites",
  community_event: "Community events",
  community_announcement: "Community announcements",
  business_inquiry: "Business inquiries",
  partnership_request: "Partnership requests",
  verification_approved: "Verification approved",
  admin_notice: "Admin notices",
  security_alert: "Security alerts",
  system: "System updates",
};

export const NOTIFICATIONS_PAGE_SIZE = 30;

export const NOTIFICATION_GROUPING_TYPES = new Set<NotificationType>([
  "profile_view",
]);
