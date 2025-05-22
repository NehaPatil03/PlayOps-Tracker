export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      missions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          mission_type: string
          telegram_link: string | null
          time_reward: number
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          mission_type: string
          telegram_link?: string | null
          time_reward: number
          title: string
          xp_reward?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          mission_type?: string
          telegram_link?: string | null
          time_reward?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          last_active: string | null
          level: number
          rank: number | null
          role: Database["public"]["Enums"]["user_role"]
          streak_days: number
          time_balance: number
          updated_at: string | null
          username: string
          xp_points: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          last_active?: string | null
          level?: number
          rank?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          streak_days?: number
          time_balance?: number
          updated_at?: string | null
          username: string
          xp_points?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          last_active?: string | null
          level?: number
          rank?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          streak_days?: number
          time_balance?: number
          updated_at?: string | null
          username?: string
          xp_points?: number
        }
        Relationships: []
      }
      qotd: {
        Row: {
          active_date: string
          created_at: string | null
          id: string
          question: string
        }
        Insert: {
          active_date: string
          created_at?: string | null
          id?: string
          question: string
        }
        Update: {
          active_date?: string
          created_at?: string | null
          id?: string
          question?: string
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          completed_at: string | null
          id: string
          mission_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          mission_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_responses: {
        Row: {
          created_at: string | null
          id: string
          qotd_id: string
          response: string
          sentences_count: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          qotd_id: string
          response: string
          sentences_count?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          qotd_id?: string
          response?: string
          sentences_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_responses_qotd_id_fkey"
            columns: ["qotd_id"]
            isOneToOne: false
            referencedRelation: "qotd"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_time_balances: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_streaks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "admin"],
    },
  },
} as const
