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
      attendance_records: {
        Row: {
          action: Database["public"]["Enums"]["attendance_action"]
          branch_id: string
          created_at: string | null
          employee_id: string
          gps_accuracy: number | null
          id: string
          is_valid_location: boolean | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          recorded_at: string | null
          scheduled_shift_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["attendance_action"]
          branch_id: string
          created_at?: string | null
          employee_id: string
          gps_accuracy?: number | null
          id?: string
          is_valid_location?: boolean | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          recorded_at?: string | null
          scheduled_shift_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["attendance_action"]
          branch_id?: string
          created_at?: string | null
          employee_id?: string
          gps_accuracy?: number | null
          id?: string
          is_valid_location?: boolean | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          recorded_at?: string | null
          scheduled_shift_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_scheduled_shift_id_fkey"
            columns: ["scheduled_shift_id"]
            isOneToOne: false
            referencedRelation: "scheduled_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          business_id: string
          created_at: string | null
          gps_radius: number | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_id: string
          created_at?: string | null
          gps_radius?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_id?: string
          created_at?: string | null
          gps_radius?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_modules: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_enabled: boolean
          module_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          module_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_modules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      employee_branch_priorities: {
        Row: {
          branch_id: string
          created_at: string | null
          employee_id: string
          id: string
          priority_order: number
          weekly_hours_limit: number | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          employee_id: string
          id?: string
          priority_order: number
          weekly_hours_limit?: number | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          priority_order?: number
          weekly_hours_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_branch_priorities_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_branch_priorities_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_constraints: {
        Row: {
          approved_by: string | null
          constraint_type: string
          created_at: string | null
          description: string | null
          employee_id: string
          end_date: string
          id: string
          is_approved: boolean | null
          start_date: string
        }
        Insert: {
          approved_by?: string | null
          constraint_type: string
          created_at?: string | null
          description?: string | null
          employee_id: string
          end_date: string
          id?: string
          is_approved?: boolean | null
          start_date: string
        }
        Update: {
          approved_by?: string | null
          constraint_type?: string
          created_at?: string | null
          description?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          is_approved?: boolean | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_constraints_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_constraints_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_contacts: {
        Row: {
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at: string | null
          created_by: string
          description: string | null
          employee_id: string
          id: string
          subject: string
        }
        Insert: {
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at?: string | null
          created_by: string
          description?: string | null
          employee_id: string
          id?: string
          subject: string
        }
        Update: {
          contact_type?: Database["public"]["Enums"]["contact_type"]
          created_at?: string | null
          created_by?: string
          description?: string | null
          employee_id?: string
          id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_contacts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string | null
          digital_signature_data: Json | null
          document_name: string
          document_type: string
          employee_id: string
          file_url: string
          id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          digital_signature_data?: Json | null
          document_name: string
          document_type: string
          employee_id: string
          file_url: string
          id?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          digital_signature_data?: Json | null
          document_name?: string
          document_type?: string
          employee_id?: string
          file_url?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_notifications: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          is_read: boolean | null
          message: string
          sent_by: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          is_read?: boolean | null
          message: string
          sent_by?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          sent_by?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_notifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_notifications_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_requests: {
        Row: {
          created_at: string | null
          description: string | null
          employee_id: string
          id: string
          request_data: Json | null
          request_type: Database["public"]["Enums"]["request_type"]
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          employee_id: string
          id?: string
          request_data?: Json | null
          request_type: Database["public"]["Enums"]["request_type"]
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          subject: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          request_data?: Json | null
          request_type?: Database["public"]["Enums"]["request_type"]
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_shift_preferences: {
        Row: {
          branch_id: string
          created_at: string | null
          day_of_week: number
          employee_id: string
          end_time: string | null
          id: string
          is_available: boolean | null
          shift_type: Database["public"]["Enums"]["shift_type"] | null
          start_time: string | null
          submission_deadline: string | null
          submission_token: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          day_of_week: number
          employee_id: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          shift_type?: Database["public"]["Enums"]["shift_type"] | null
          start_time?: string | null
          submission_deadline?: string | null
          submission_token?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          day_of_week?: number
          employee_id?: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          shift_type?: Database["public"]["Enums"]["shift_type"] | null
          start_time?: string | null
          submission_deadline?: string | null
          submission_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_shift_preferences_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_shift_preferences_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          business_id: string
          created_at: string | null
          email: string | null
          employee_id: string | null
          employee_type: Database["public"]["Enums"]["employee_type"]
          first_name: string
          hire_date: string | null
          id: string
          id_number: string | null
          is_active: boolean | null
          last_name: string
          main_branch_id: string | null
          notes: string | null
          phone: string | null
          preferred_shift_type: Database["public"]["Enums"]["shift_type"] | null
          termination_date: string | null
          updated_at: string | null
          weekly_hours_required: number | null
        }
        Insert: {
          address?: string | null
          business_id: string
          created_at?: string | null
          email?: string | null
          employee_id?: string | null
          employee_type?: Database["public"]["Enums"]["employee_type"]
          first_name: string
          hire_date?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          last_name: string
          main_branch_id?: string | null
          notes?: string | null
          phone?: string | null
          preferred_shift_type?:
            | Database["public"]["Enums"]["shift_type"]
            | null
          termination_date?: string | null
          updated_at?: string | null
          weekly_hours_required?: number | null
        }
        Update: {
          address?: string | null
          business_id?: string
          created_at?: string | null
          email?: string | null
          employee_id?: string | null
          employee_type?: Database["public"]["Enums"]["employee_type"]
          first_name?: string
          hire_date?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          last_name?: string
          main_branch_id?: string | null
          notes?: string | null
          phone?: string | null
          preferred_shift_type?:
            | Database["public"]["Enums"]["shift_type"]
            | null
          termination_date?: string | null
          updated_at?: string | null
          weekly_hours_required?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_main_branch_id_fkey"
            columns: ["main_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      module_data: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          module_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          module_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          module_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_data_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_fields: {
        Row: {
          created_at: string
          display_order: number
          field_name: string
          field_options: Json | null
          field_type: string
          id: string
          is_required: boolean
          module_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          field_name: string
          field_options?: Json | null
          field_type: string
          id?: string
          is_required?: boolean
          module_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          field_name?: string
          field_options?: Json | null
          field_type?: string
          id?: string
          is_required?: boolean
          module_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_fields_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_custom: boolean
          module_config: Json | null
          name: string
          route: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_custom?: boolean
          module_config?: Json | null
          name: string
          route?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_custom?: boolean
          module_config?: Json | null
          name?: string
          route?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_shifts: {
        Row: {
          created_at: string | null
          employee_id: string | null
          id: string
          is_assigned: boolean | null
          notes: string | null
          shift_date: string
          shift_template_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_assigned?: boolean | null
          notes?: string | null
          shift_date: string
          shift_template_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_assigned?: boolean | null
          notes?: string | null
          shift_date?: string
          shift_template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_shifts_shift_template_id_fkey"
            columns: ["shift_template_id"]
            isOneToOne: false
            referencedRelation: "shift_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_templates: {
        Row: {
          branch_id: string
          business_id: string
          created_at: string | null
          end_time: string
          id: string
          is_active: boolean | null
          name: string
          required_employees: number | null
          shift_type: Database["public"]["Enums"]["shift_type"]
          start_time: string
        }
        Insert: {
          branch_id: string
          business_id: string
          created_at?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          name: string
          required_employees?: number | null
          shift_type: Database["public"]["Enums"]["shift_type"]
          start_time: string
        }
        Update: {
          branch_id?: string
          business_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          name?: string
          required_employees?: number | null
          shift_type?: Database["public"]["Enums"]["shift_type"]
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_templates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_business_permissions: {
        Row: {
          business_id: string
          created_at: string
          id: string
          module_id: string
          permission: Database["public"]["Enums"]["permission_type"]
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          module_id: string
          permission: Database["public"]["Enums"]["permission_type"]
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          module_id?: string
          permission?: Database["public"]["Enums"]["permission_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_business_permissions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_business_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_business_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_custom_module_table: {
        Args: {
          module_id_param: string
          table_name_param: string
          fields_config: Json
        }
        Returns: boolean
      }
      generate_module_route: {
        Args: { module_name: string }
        Returns: string
      }
      generate_table_name: {
        Args: { module_name: string }
        Returns: string
      }
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      attendance_action: "check_in" | "check_out"
      contact_type: "inquiry" | "warning" | "reward" | "general"
      employee_type: "permanent" | "temporary" | "youth" | "contractor"
      permission_type: "read" | "write" | "delete" | "admin"
      request_status: "pending" | "approved" | "rejected"
      request_type: "vacation" | "equipment" | "shift_change"
      shift_type: "morning" | "afternoon" | "evening" | "night" | "full_day"
      user_role: "super_admin" | "business_admin" | "business_user"
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
      attendance_action: ["check_in", "check_out"],
      contact_type: ["inquiry", "warning", "reward", "general"],
      employee_type: ["permanent", "temporary", "youth", "contractor"],
      permission_type: ["read", "write", "delete", "admin"],
      request_status: ["pending", "approved", "rejected"],
      request_type: ["vacation", "equipment", "shift_change"],
      shift_type: ["morning", "afternoon", "evening", "night", "full_day"],
      user_role: ["super_admin", "business_admin", "business_user"],
    },
  },
} as const
