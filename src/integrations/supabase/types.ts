export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      astral_charts: {
        Row: {
          analysis: string | null
          ascendant: string
          birth_date: string
          birth_place: string
          birth_time: string
          created_at: string
          full_name: string
          id: string
          moon_sign: string
          sun_sign_element: string
          sun_sign_name: string
          sun_sign_planet: string
          sun_sign_symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis?: string | null
          ascendant: string
          birth_date: string
          birth_place: string
          birth_time: string
          created_at?: string
          full_name: string
          id?: string
          moon_sign: string
          sun_sign_element: string
          sun_sign_name: string
          sun_sign_planet: string
          sun_sign_symbol?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis?: string | null
          ascendant?: string
          birth_date?: string
          birth_place?: string
          birth_time?: string
          created_at?: string
          full_name?: string
          id?: string
          moon_sign?: string
          sun_sign_element?: string
          sun_sign_name?: string
          sun_sign_planet?: string
          sun_sign_symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      astral_extras: {
        Row: {
          created_at: string
          id: string
          result: Json
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          result: Json
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          result?: Json
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_limits: {
        Row: {
          angels_count: number
          created_at: string
          id: string
          limit_date: string
          oracle_count: number
          secret_count: number
          tarot_count: number
          user_id: string
        }
        Insert: {
          angels_count?: number
          created_at?: string
          id?: string
          limit_date: string
          oracle_count?: number
          secret_count?: number
          tarot_count?: number
          user_id: string
        }
        Update: {
          angels_count?: number
          created_at?: string
          id?: string
          limit_date?: string
          oracle_count?: number
          secret_count?: number
          tarot_count?: number
          user_id?: string
        }
        Relationships: []
      }
      daily_readings: {
        Row: {
          content: Json
          created_at: string
          id: string
          reading_date: string
          reading_type: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          reading_date: string
          reading_type?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          reading_date?: string
          reading_type?: string
          user_id?: string
        }
        Relationships: []
      }
      important_dates: {
        Row: {
          created_at: string | null
          event_date: string
          event_icon: string | null
          event_latitude: number | null
          event_longitude: number | null
          event_name: string
          event_time: string | null
          event_timezone: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_date: string
          event_icon?: string | null
          event_latitude?: number | null
          event_longitude?: number | null
          event_name: string
          event_time?: string | null
          event_timezone?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_date?: string
          event_icon?: string | null
          event_latitude?: number | null
          event_longitude?: number | null
          event_name?: string
          event_time?: string | null
          event_timezone?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: string | null
          mood_analysis: string | null
          prompt: string
          tags: string[] | null
          user_id: string
          word_count: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          mood_analysis?: string | null
          prompt?: string
          tags?: string[] | null
          user_id: string
          word_count?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          mood_analysis?: string | null
          prompt?: string
          tags?: string[] | null
          user_id?: string
          word_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_predictions: {
        Row: {
          created_at: string
          id: string
          prediction: string
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          prediction: string
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          prediction?: string
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_reading_count: {
        Args: { p_date: string; p_type: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
