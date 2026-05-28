// Generated-style typings that match the SQL in supabase/schema.sql.
// Keep these in sync if you edit the schema.

export type UserRole = "user" | "admin";
export type ProfileStatus = "pending" | "approved" | "rejected" | "suspended";
export type ConnectionStatus = "pending" | "accepted" | "declined" | "blocked";
export type NotificationType =
  | "connection_request"
  | "connection_accepted"
  | "new_message"
  | "profile_view"
  | "mention"
  | "system";

export type RelationType =
  | "sibling"
  | "parent"
  | "child"
  | "cousin"
  | "spouse"
  | "business_partner"
  | "employee"
  | "manager"
  | "friend"
  | "mentor";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  avatar_position_x: number;
  avatar_position_y: number;
  cover_position_x: number;
  cover_position_y: number;
  occupation: string | null;
  company: string | null;
  bio: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  role: UserRole;
  status: ProfileStatus;
  is_verified: boolean;
  is_online: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  id: string;
  profile_id: string;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  linkedin: string | null;
  whatsapp: string | null;
  twitter: string | null;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  industry: string | null;
  description: string | null;
  website: string | null;
  location: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Relation {
  id: string;
  user_id: string;
  related_user_id: string;
  relation_type: RelationType;
  notes: string | null;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  created_at: string;
  responded_at: string | null;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read_status: boolean;
  created_at: string;
}

export interface TypingIndicator {
  id: string;
  sender_id: string;
  receiver_id: string;
  is_typing: boolean;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_id: string | null;
  target_type: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  link: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

// ---- composite / view types ----

export interface ProfileStats {
  id: string;
  connections_count: number;
  relations_count: number;
  messages_sent: number;
}

export interface ProfileWithSocials extends Profile {
  social_links: SocialLinks | null;
}

export interface ProfileWithStats extends Profile {
  stats?: ProfileStats;
  social_links?: SocialLinks | null;
}

export interface RelationWithProfile extends Relation {
  related_profile: Profile;
}

export interface MessageWithProfiles extends Message {
  sender?: Profile;
  receiver?: Profile;
}

export interface ConversationPreview {
  partner: Profile;
  last_message: Message | null;
  unread_count: number;
}

// ---- Supabase Database typing (used by createClient generics) ----

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string; full_name: string; email: string };
        Update: Partial<Profile>;
      };
      social_links: {
        Row: SocialLinks;
        Insert: Partial<SocialLinks> & { profile_id: string };
        Update: Partial<SocialLinks>;
      };
      businesses: {
        Row: Business;
        Insert: Partial<Business> & { owner_id: string; name: string };
        Update: Partial<Business>;
      };
      relations: {
        Row: Relation;
        Insert: Partial<Relation> & {
          user_id: string;
          related_user_id: string;
          relation_type: RelationType;
        };
        Update: Partial<Relation>;
      };
      connections: {
        Row: Connection;
        Insert: Partial<Connection> & {
          requester_id: string;
          addressee_id: string;
        };
        Update: Partial<Connection>;
      };
      messages: {
        Row: Message;
        Insert: Partial<Message> & {
          sender_id: string;
          receiver_id: string;
          message: string;
        };
        Update: Partial<Message>;
      };
      typing_indicators: {
        Row: TypingIndicator;
        Insert: Partial<TypingIndicator> & {
          sender_id: string;
          receiver_id: string;
        };
        Update: Partial<TypingIndicator>;
      };
      notifications: {
        Row: NotificationRow;
        Insert: Partial<NotificationRow> & {
          user_id: string;
          type: NotificationType;
          title: string;
        };
        Update: Partial<NotificationRow>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Partial<ActivityLog> & { action: string };
        Update: Partial<ActivityLog>;
      };
      banners: {
        Row: Banner;
        Insert: Partial<Banner> & { title: string };
        Update: Partial<Banner>;
      };
    };
    Views: {
      profile_stats: {
        Row: ProfileStats;
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      profile_status: ProfileStatus;
      relation_type: RelationType;
      connection_status: ConnectionStatus;
      notification_type: NotificationType;
    };
  };
}
