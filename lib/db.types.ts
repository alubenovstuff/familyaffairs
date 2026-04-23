export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string;
          name: string;
          daily_base_pts: number;
          auto_approve: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['families']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['families']['Insert']>;
      };
      members: {
        Row: {
          id: string;
          user_id: string | null;
          family_id: string;
          name: string;
          init: string;
          color: string;
          role: string;
          points_balance: number;
          points_total_earned: number;
          current_streak: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['members']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['members']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          family_id: string;
          title: string;
          description: string | null;
          type: string;
          status: string;
          pts: number;
          due: string | null;
          streak: number;
          duration: number | null;
          reward: string;
          reward_label: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      task_assignees: {
        Row: { task_id: string; member_id: string };
        Insert: Database['public']['Tables']['task_assignees']['Row'];
        Update: Partial<Database['public']['Tables']['task_assignees']['Row']>;
      };
      badges: {
        Row: {
          id: string;
          family_id: string;
          title: string;
          emoji: string;
          description: string | null;
          category: string | null;
          tier: string;
          pts_reward: number;
          requirement_value: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['badges']['Insert']>;
      };
      member_badges: {
        Row: { id: string; member_id: string; badge_id: string; earned_at: string };
        Insert: Omit<Database['public']['Tables']['member_badges']['Row'], 'id' | 'earned_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['member_badges']['Insert']>;
      };
      wishes: {
        Row: {
          id: string;
          member_id: string;
          family_id: string;
          title: string;
          emoji: string | null;
          price: number;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wishes']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['wishes']['Insert']>;
      };
      ledger: {
        Row: {
          id: string;
          member_id: string;
          family_id: string;
          amount: number;
          description: string | null;
          type: string;
          task_id: string | null;
          badge_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ledger']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['ledger']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          email_verified: string | null;
          image: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
  };
}
