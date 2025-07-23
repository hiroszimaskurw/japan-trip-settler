import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Typy bazy danych
export interface Database {
  public: {
    Tables: {
      expense_groups: {
        Row: {
          id: string;
          name: string;
          description: string;
          currency: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          share_code: string;
        };
        Insert: {
          id?: string;
          name?: string;
          description?: string;
          currency?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          share_code?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          currency?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          share_code?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          color: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          color?: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          color?: string;
          user_id?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          group_id: string;
          description: string;
          amount: number;
          paid_by: string;
          category: string;
          date: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          description: string;
          amount: number;
          paid_by: string;
          category?: string;
          date?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          description?: string;
          amount?: number;
          paid_by?: string;
          category?: string;
          date?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
      expense_splits: {
        Row: {
          id: string;
          expense_id: string;
          member_id: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_id: string;
          member_id: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          expense_id?: string;
          member_id?: string;
          amount?: number;
          created_at?: string;
        };
      };
    };
  };
}