export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      families: {
        Row: { id: string; name: string; daily_base_pts: number; auto_approve: string; created_at: string };
        Insert: { name: string; daily_base_pts?: number; auto_approve?: string; id?: string };
        Update: { name?: string; daily_base_pts?: number; auto_approve?: string };
        Relationships: [];
      };
      members: {
        Row: { id: string; user_id: string | null; family_id: string; name: string; init: string; color: string; role: string; points_balance: number; points_total_earned: number; current_streak: number; last_streak_date: string | null; created_at: string };
        Insert: { user_id?: string | null; family_id: string; name: string; init: string; color: string; role: string; points_balance?: number; points_total_earned?: number; current_streak?: number; last_streak_date?: string | null; id?: string };
        Update: { user_id?: string | null; name?: string; init?: string; color?: string; role?: string; points_balance?: number; points_total_earned?: number; current_streak?: number; last_streak_date?: string | null };
        Relationships: [];
      };
      tasks: {
        Row: { id: string; family_id: string; title: string; description: string | null; type: string; status: string; pts: number; due: string | null; streak: number; duration: number | null; reward: string; reward_label: string | null; created_by: string | null; created_at: string };
        Insert: { family_id: string; title: string; type: string; description?: string | null; status?: string; pts?: number; due?: string | null; streak?: number; duration?: number | null; reward?: string; reward_label?: string | null; created_by?: string | null; id?: string };
        Update: { title?: string; type?: string; description?: string | null; status?: string; pts?: number; due?: string | null; streak?: number; duration?: number | null; reward?: string; reward_label?: string | null };
        Relationships: [];
      };
      task_assignees: {
        Row: { task_id: string; member_id: string };
        Insert: { task_id: string; member_id: string };
        Update: { task_id?: string; member_id?: string };
        Relationships: [];
      };
      badges: {
        Row: { id: string; family_id: string; title: string; emoji: string; description: string | null; category: string | null; tier: string; pts_reward: number; requirement_value: number | null; created_at: string };
        Insert: { family_id: string; title: string; emoji: string; description?: string | null; category?: string | null; tier: string; pts_reward?: number; requirement_value?: number | null; id?: string };
        Update: { title?: string; emoji?: string; description?: string | null; category?: string | null; tier?: string; pts_reward?: number; requirement_value?: number | null };
        Relationships: [];
      };
      member_badges: {
        Row: { id: string; member_id: string; badge_id: string; earned_at: string };
        Insert: { member_id: string; badge_id: string; id?: string };
        Update: { member_id?: string; badge_id?: string };
        Relationships: [];
      };
      wishes: {
        Row: { id: string; member_id: string; family_id: string; title: string; emoji: string | null; price: number; status: string; created_at: string };
        Insert: { member_id: string; family_id: string; title: string; price: number; emoji?: string | null; status?: string; id?: string };
        Update: { title?: string; emoji?: string | null; price?: number; status?: string };
        Relationships: [];
      };
      ledger: {
        Row: { id: string; member_id: string; family_id: string; amount: number; description: string | null; type: string; task_id: string | null; badge_id: string | null; created_at: string };
        Insert: { member_id: string; family_id: string; amount: number; description?: string | null; type: string; task_id?: string | null; badge_id?: string | null; id?: string };
        Update: { amount?: number; description?: string | null; type?: string };
        Relationships: [];
      };
      family_invites: {
        Row: { id: string; family_id: string; token: string; used: boolean; created_at: string };
        Insert: { family_id: string; token?: string; used?: boolean; id?: string };
        Update: { used?: boolean };
        Relationships: [];
      };
      users: {
        Row: { id: string; name: string | null; email: string | null; email_verified: string | null; image: string | null };
        Insert: { name?: string | null; email?: string | null; email_verified?: string | null; image?: string | null; id?: string };
        Update: { name?: string | null; email?: string | null; email_verified?: string | null; image?: string | null };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_points: { Args: { p_member_id: string; p_amount: number }; Returns: void };
      decrement_points: { Args: { p_member_id: string; p_amount: number }; Returns: void };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
