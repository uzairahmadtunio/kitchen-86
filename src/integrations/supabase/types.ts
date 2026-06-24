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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cart_suggestions: {
        Row: {
          display_order: number | null
          id: string
          is_active: boolean | null
          label: string | null
          menu_item_id: string | null
        }
        Insert: {
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          menu_item_id?: string | null
        }
        Update: {
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          menu_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_suggestions_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          badge_text: string | null
          deal_price: number
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          items_included: string | null
          name: string
          original_price: number | null
          valid_until: string | null
        }
        Insert: {
          badge_text?: string | null
          deal_price: number
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          items_included?: string | null
          name: string
          original_price?: number | null
          valid_until?: string | null
        }
        Update: {
          badge_text?: string | null
          deal_price?: number
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          items_included?: string | null
          name?: string
          original_price?: number | null
          valid_until?: string | null
        }
        Relationships: []
      }
      delivery_areas: {
        Row: {
          charge: number
          est_time: string | null
          id: string
          is_active: boolean | null
          min_order: number | null
          name: string
          zone: string | null
        }
        Insert: {
          charge?: number
          est_time?: string | null
          id?: string
          is_active?: boolean | null
          min_order?: number | null
          name: string
          zone?: string | null
        }
        Update: {
          charge?: number
          est_time?: string | null
          id?: string
          is_active?: boolean | null
          min_order?: number | null
          name?: string
          zone?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          addons: Json | null
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          name: string
          original_price: number | null
          price: number
          sizes: Json | null
        }
        Insert: {
          addons?: Json | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          name: string
          original_price?: number | null
          price: number
          sizes?: Json | null
        }
        Update: {
          addons?: Json | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          sizes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          customizations: Json | null
          id: string
          item_name: string
          item_price: number
          order_id: string | null
          quantity: number
          subtotal: number
        }
        Insert: {
          customizations?: Json | null
          id?: string
          item_name: string
          item_price: number
          order_id?: string | null
          quantity: number
          subtotal: number
        }
        Update: {
          customizations?: Json | null
          id?: string
          item_name?: string
          item_price?: number
          order_id?: string | null
          quantity?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          created_at: string | null
          customer_name: string
          customer_phone: string
          delivery_area: string | null
          delivery_charge: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          status: string | null
          subtotal: number
          total: number
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          customer_name: string
          customer_phone: string
          delivery_area?: string | null
          delivery_charge?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          status?: string | null
          subtotal: number
          total: number
        }
        Update: {
          address?: string | null
          created_at?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_area?: string | null
          delivery_charge?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          status?: string | null
          subtotal?: number
          total?: number
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_number: string | null
          account_title: string | null
          code: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          instructions: string | null
          is_active: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          account_title?: string | null
          code: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          account_title?: string | null
          code?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_name: string
          id: string
          is_approved: boolean | null
          rating: number
          video_url: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_name: string
          id?: string
          is_approved?: boolean | null
          rating: number
          video_url?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_name?: string
          id?: string
          is_approved?: boolean | null
          rating?: number
          video_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      track_order: {
        Args: { p_order_number: string; p_phone: string }
        Returns: Json
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
