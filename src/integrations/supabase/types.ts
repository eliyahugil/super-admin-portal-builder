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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
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
      business_integrations: {
        Row: {
          business_id: string
          config: Json | null
          created_at: string
          credentials: Json
          display_name: string
          id: string
          integration_name: string
          is_active: boolean
          last_sync: string | null
          last_tested_at: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          config?: Json | null
          created_at?: string
          credentials?: Json
          display_name: string
          id?: string
          integration_name: string
          is_active?: boolean
          last_sync?: string | null
          last_tested_at?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          config?: Json | null
          created_at?: string
          credentials?: Json
          display_name?: string
          id?: string
          integration_name?: string
          is_active?: boolean
          last_sync?: string | null
          last_tested_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_module_config: {
        Row: {
          business_id: string
          created_at: string
          custom_config: Json | null
          custom_permissions: Json | null
          enabled_at: string | null
          enabled_by: string | null
          id: string
          is_enabled: boolean
          module_key: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          custom_config?: Json | null
          custom_permissions?: Json | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean
          module_key: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          custom_config?: Json | null
          custom_permissions?: Json | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean
          module_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_module_config_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_module_config_module_key_fkey"
            columns: ["module_key"]
            isOneToOne: false
            referencedRelation: "modules_config"
            referencedColumns: ["module_key"]
          },
        ]
      }
      business_module_subscriptions: {
        Row: {
          business_id: string
          created_at: string
          current_usage: number | null
          end_date: string | null
          id: string
          is_active: boolean
          module_key: string
          start_date: string
          subscription_id: string | null
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          business_id: string
          created_at?: string
          current_usage?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          module_key: string
          start_date: string
          subscription_id?: string | null
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string
          current_usage?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          module_key?: string
          start_date?: string
          subscription_id?: string | null
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_module_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_module_subscriptions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "business_subscriptions"
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
      business_settings: {
        Row: {
          allow_employee_reporting_web: boolean
          allow_past_shift_editing: boolean
          allow_shift_editing: boolean
          allow_shift_submission_without_token: boolean
          auto_shift_reminders: boolean
          business_id: string
          created_at: string
          id: string
          reminder_day: string
          reminder_hour: number
          require_employee_gps: boolean
          require_employee_image: boolean
          updated_at: string
        }
        Insert: {
          allow_employee_reporting_web?: boolean
          allow_past_shift_editing?: boolean
          allow_shift_editing?: boolean
          allow_shift_submission_without_token?: boolean
          auto_shift_reminders?: boolean
          business_id: string
          created_at?: string
          id?: string
          reminder_day?: string
          reminder_hour?: number
          require_employee_gps?: boolean
          require_employee_image?: boolean
          updated_at?: string
        }
        Update: {
          allow_employee_reporting_web?: boolean
          allow_past_shift_editing?: boolean
          allow_shift_editing?: boolean
          allow_shift_submission_without_token?: boolean
          auto_shift_reminders?: boolean
          business_id?: string
          created_at?: string
          id?: string
          reminder_day?: string
          reminder_hour?: number
          require_employee_gps?: boolean
          require_employee_image?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscriptions: {
        Row: {
          business_id: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          is_active: boolean
          plan_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          plan_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          plan_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          admin_email: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          owner_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          admin_email?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          owner_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          admin_email?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      custom_field_values: {
        Row: {
          created_at: string
          employee_id: string | null
          field_name: string
          id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          field_name: string
          id?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          field_name?: string
          id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_management: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          module_id: string
          updated_at: string
          "שם ": string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          module_id: string
          updated_at?: string
          "שם "?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          module_id?: string
          updated_at?: string
          "שם "?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_management_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_management_customers: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          module_id: string
          updated_at: string
          "שם הלקוח ": string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          module_id: string
          updated_at?: string
          "שם הלקוח "?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          module_id?: string
          updated_at?: string
          "שם הלקוח "?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_management_customers_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_agreements: {
        Row: {
          business_id: string
          content: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          status: string
          title: string
          type: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          status?: string
          title: string
          type?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_agreements_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_agreements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_numbers: {
        Row: {
          business_id: string
          created_at: string
          customer_number: number
          id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_number: number
          id?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_number?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_numbers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          business_id: string
          company: string | null
          contact_person: string | null
          created_at: string
          customer_type: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_id: string
          company?: string | null
          contact_person?: string | null
          created_at?: string
          customer_type?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_id?: string
          company?: string | null
          contact_person?: string | null
          created_at?: string
          customer_type?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_branch_assignments: {
        Row: {
          branch_id: string | null
          created_at: string
          employee_id: string | null
          id: string
          is_active: boolean
          max_weekly_hours: number | null
          priority_order: number
          role_name: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          is_active?: boolean
          max_weekly_hours?: number | null
          priority_order?: number
          role_name: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          is_active?: boolean
          max_weekly_hours?: number | null
          priority_order?: number
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_branch_assignments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_branch_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      employee_document_reminders: {
        Row: {
          document_id: string
          employee_id: string
          id: string
          message: string | null
          reminder_type: string
          sent_at: string
          sent_by: string | null
        }
        Insert: {
          document_id: string
          employee_id: string
          id?: string
          message?: string | null
          reminder_type: string
          sent_at?: string
          sent_by?: string | null
        }
        Update: {
          document_id?: string
          employee_id?: string
          id?: string
          message?: string | null
          reminder_type?: string
          sent_at?: string
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_document_reminders_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "employee_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_document_reminders_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          digital_signature_data: Json | null
          document_name: string
          document_type: string
          employee_id: string | null
          file_url: string
          id: string
          is_template: boolean
          reminder_count: number
          reminder_sent_at: string | null
          status: string
          uploaded_by: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          digital_signature_data?: Json | null
          document_name: string
          document_type: string
          employee_id?: string | null
          file_url: string
          id?: string
          is_template?: boolean
          reminder_count?: number
          reminder_sent_at?: string | null
          status?: string
          uploaded_by: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          digital_signature_data?: Json | null
          document_name?: string
          document_type?: string
          employee_id?: string | null
          file_url?: string
          id?: string
          is_template?: boolean
          reminder_count?: number
          reminder_sent_at?: string | null
          status?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
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
      employee_field_templates: {
        Row: {
          business_id: string
          created_at: string
          display_order: number
          field_name: string
          field_options: Json | null
          field_type: string
          id: string
          is_active: boolean
          is_required: boolean
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          display_order?: number
          field_name: string
          field_options?: Json | null
          field_type: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          display_order?: number
          field_name?: string
          field_options?: Json | null
          field_type?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_field_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_files: {
        Row: {
          business_id: string
          created_at: string | null
          employee_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          employee_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          employee_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_files_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_files_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_notes: {
        Row: {
          business_id: string
          content: string
          created_at: string
          created_by: string
          employee_id: string
          id: string
          is_warning: boolean
          note_type: string
          updated_at: string
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string
          created_by: string
          employee_id: string
          id?: string
          is_warning?: boolean
          note_type: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string
          created_by?: string
          employee_id?: string
          id?: string
          is_warning?: boolean
          note_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_notes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_notes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      employee_salary_history: {
        Row: {
          amount: number
          approved_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          effective_date: string
          employee_id: string
          id: string
          notes: string | null
          reason: string | null
          type: string
        }
        Insert: {
          amount: number
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_date: string
          employee_id: string
          id?: string
          notes?: string | null
          reason?: string | null
          type: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          reason?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_salary_history_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salary_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      employee_shift_requests: {
        Row: {
          branch_preference: string | null
          created_at: string
          employee_id: string | null
          end_time: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role_preference: string | null
          shift_date: string
          start_time: string
          status: string
          submission_deadline: string | null
          submission_token: string | null
        }
        Insert: {
          branch_preference?: string | null
          created_at?: string
          employee_id?: string | null
          end_time: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_preference?: string | null
          shift_date: string
          start_time: string
          status?: string
          submission_deadline?: string | null
          submission_token?: string | null
        }
        Update: {
          branch_preference?: string | null
          created_at?: string
          employee_id?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_preference?: string | null
          shift_date?: string
          start_time?: string
          status?: string
          submission_deadline?: string | null
          submission_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_shift_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_shift_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_weekly_tokens: {
        Row: {
          created_at: string
          employee_id: string | null
          expires_at: string
          id: string
          is_active: boolean
          token: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          expires_at: string
          id?: string
          is_active?: boolean
          token?: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          token?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_weekly_tokens_employee_id_fkey"
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
          is_archived: boolean
          is_system_user: boolean
          last_name: string
          main_branch_id: string | null
          notes: string | null
          password_hash: string | null
          phone: string | null
          preferred_shift_type: Database["public"]["Enums"]["shift_type"] | null
          termination_date: string | null
          updated_at: string | null
          username: string | null
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
          is_archived?: boolean
          is_system_user?: boolean
          last_name: string
          main_branch_id?: string | null
          notes?: string | null
          password_hash?: string | null
          phone?: string | null
          preferred_shift_type?:
            | Database["public"]["Enums"]["shift_type"]
            | null
          termination_date?: string | null
          updated_at?: string | null
          username?: string | null
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
          is_archived?: boolean
          is_system_user?: boolean
          last_name?: string
          main_branch_id?: string | null
          notes?: string | null
          password_hash?: string | null
          phone?: string | null
          preferred_shift_type?:
            | Database["public"]["Enums"]["shift_type"]
            | null
          termination_date?: string | null
          updated_at?: string | null
          username?: string | null
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
      global_integrations: {
        Row: {
          api_key: string | null
          config: Json | null
          created_at: string
          description: string | null
          display_name: string
          id: string
          integration_name: string
          is_active: boolean
          is_global: boolean
          last_tested_at: string | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          config?: Json | null
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          integration_name: string
          is_active?: boolean
          is_global?: boolean
          last_tested_at?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          config?: Json | null
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          integration_name?: string
          is_active?: boolean
          is_global?: boolean
          last_tested_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      integration_audit_log: {
        Row: {
          action: string
          business_id: string | null
          changes: Json | null
          created_at: string
          id: string
          integration_name: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          business_id?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          integration_name: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          business_id?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          integration_name?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_audit_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          action: string
          business_id: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          integration_id: string | null
          integration_name: string
          request_data: Json | null
          response_data: Json | null
          status: string
          timestamp: string | null
        }
        Insert: {
          action: string
          business_id?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_id?: string | null
          integration_name: string
          request_data?: Json | null
          response_data?: Json | null
          status: string
          timestamp?: string | null
        }
        Update: {
          action?: string
          business_id?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_id?: string | null
          integration_name?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
          customer_number: number | null
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
          customer_number?: number | null
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
          customer_number?: number | null
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
      modules_config: {
        Row: {
          category: string
          config_schema: Json | null
          created_at: string
          default_visible: boolean
          description: string | null
          display_order: number | null
          enabled_by_superadmin: boolean
          icon: string | null
          id: string
          integration_type: string | null
          is_core_module: boolean
          minimum_role: string | null
          module_key: string
          module_name: string
          permissions_required: Json | null
          requires_integration: boolean
          route_pattern: string
          updated_at: string
        }
        Insert: {
          category?: string
          config_schema?: Json | null
          created_at?: string
          default_visible?: boolean
          description?: string | null
          display_order?: number | null
          enabled_by_superadmin?: boolean
          icon?: string | null
          id?: string
          integration_type?: string | null
          is_core_module?: boolean
          minimum_role?: string | null
          module_key: string
          module_name: string
          permissions_required?: Json | null
          requires_integration?: boolean
          route_pattern: string
          updated_at?: string
        }
        Update: {
          category?: string
          config_schema?: Json | null
          created_at?: string
          default_visible?: boolean
          description?: string | null
          display_order?: number | null
          enabled_by_superadmin?: boolean
          icon?: string | null
          id?: string
          integration_type?: string | null
          is_core_module?: boolean
          minimum_role?: string | null
          module_key?: string
          module_name?: string
          permissions_required?: Json | null
          requires_integration?: boolean
          route_pattern?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_module_permissions: {
        Row: {
          created_at: string
          id: string
          is_included: boolean
          module_key: string
          plan_id: string
          usage_limit: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_included?: boolean
          module_key: string
          plan_id: string
          usage_limit?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_included?: boolean
          module_key?: string
          plan_id?: string
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_module_permissions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_shifts: {
        Row: {
          branch_id: string | null
          business_id: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          is_archived: boolean
          is_assigned: boolean | null
          notes: string | null
          shift_date: string
          shift_template_id: string
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          business_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_archived?: boolean
          is_assigned?: boolean | null
          notes?: string | null
          shift_date: string
          shift_template_id: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          business_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_archived?: boolean
          is_assigned?: boolean | null
          notes?: string | null
          shift_date?: string
          shift_template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_shifts_branch_fk"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
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
      shift_reminder_logs: {
        Row: {
          business_id: string | null
          created_at: string
          employee_id: string | null
          error_details: string | null
          id: string
          message_content: string | null
          method: string
          phone_number: string | null
          sent_at: string
          status: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          employee_id?: string | null
          error_details?: string | null
          id?: string
          message_content?: string | null
          method: string
          phone_number?: string | null
          sent_at?: string
          status: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          employee_id?: string | null
          error_details?: string | null
          id?: string
          message_content?: string | null
          method?: string
          phone_number?: string | null
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_reminder_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_reminder_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_roles: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_roles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_submissions: {
        Row: {
          created_at: string | null
          employee_id: string | null
          id: string
          notes: string | null
          shifts: Json
          status: string | null
          submitted_at: string | null
          token: string
          updated_at: string | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          shifts?: Json
          status?: string | null
          submitted_at?: string | null
          token: string
          updated_at?: string | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          shifts?: Json
          status?: string | null
          submitted_at?: string | null
          token?: string
          updated_at?: string | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_submissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_template_branches: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          shift_template_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          shift_template_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          shift_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_template_branches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_template_branches_shift_template_id_fkey"
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
          is_archived: boolean
          name: string
          required_employees: number | null
          role_name: string | null
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
          is_archived?: boolean
          name: string
          required_employees?: number | null
          role_name?: string | null
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
          is_archived?: boolean
          name?: string
          required_employees?: number | null
          role_name?: string | null
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
      shift_token_logs: {
        Row: {
          business_id: string
          channel_type: string
          created_at: string
          email_address: string | null
          employee_id: string | null
          error_message: string | null
          id: string
          message_content: string | null
          phone_number: string | null
          sent_at: string
          status: string
        }
        Insert: {
          business_id: string
          channel_type: string
          created_at?: string
          email_address?: string | null
          employee_id?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          phone_number?: string | null
          sent_at?: string
          status?: string
        }
        Update: {
          business_id?: string
          channel_type?: string
          created_at?: string
          email_address?: string | null
          employee_id?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          phone_number?: string | null
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_token_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_token_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_token_schedules: {
        Row: {
          business_id: string
          channel_type: string
          created_at: string
          id: string
          is_active: boolean
          message_template: string | null
          send_day: string
          send_time: string
          updated_at: string
        }
        Insert: {
          business_id: string
          channel_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message_template?: string | null
          send_day: string
          send_time?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          channel_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message_template?: string | null
          send_day?: string
          send_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_token_schedules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_tokens: {
        Row: {
          branch_preference_1: string | null
          branch_preference_2: string | null
          created_at: string
          employee_id: string
          expires_at: string
          id: string
          is_used: boolean | null
          submitted_data: Json | null
          token: string
        }
        Insert: {
          branch_preference_1?: string | null
          branch_preference_2?: string | null
          created_at?: string
          employee_id: string
          expires_at: string
          id?: string
          is_used?: boolean | null
          submitted_data?: Json | null
          token: string
        }
        Update: {
          branch_preference_1?: string | null
          branch_preference_2?: string | null
          created_at?: string
          employee_id?: string
          expires_at?: string
          id?: string
          is_used?: boolean | null
          submitted_data?: Json | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_tokens_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_modules: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          module_id: string
          name: string
          route: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          module_id: string
          name: string
          route: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string
          name?: string
          route?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_cycle: string
          created_at: string
          description: string | null
          duration_months: number | null
          id: string
          is_active: boolean
          name: string
          plan_type: string
          updated_at: string
        }
        Insert: {
          billing_cycle: string
          created_at?: string
          description?: string | null
          duration_months?: number | null
          id?: string
          is_active?: boolean
          name: string
          plan_type: string
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          description?: string | null
          duration_months?: number | null
          id?: string
          is_active?: boolean
          name?: string
          plan_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      supported_integrations: {
        Row: {
          category: string
          created_at: string
          credential_fields: Json
          description: string | null
          display_name: string
          documentation_url: string | null
          icon: string | null
          id: string
          integration_name: string
          is_active: boolean
          requires_business_credentials: boolean
          requires_global_key: boolean
        }
        Insert: {
          category: string
          created_at?: string
          credential_fields?: Json
          description?: string | null
          display_name: string
          documentation_url?: string | null
          icon?: string | null
          id?: string
          integration_name: string
          is_active?: boolean
          requires_business_credentials?: boolean
          requires_global_key?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          credential_fields?: Json
          description?: string | null
          display_name?: string
          documentation_url?: string | null
          icon?: string | null
          id?: string
          integration_name?: string
          is_active?: boolean
          requires_business_credentials?: boolean
          requires_global_key?: boolean
        }
        Relationships: []
      }
      user_access_requests: {
        Row: {
          created_at: string
          id: string
          request_reason: string | null
          requested_business_id: string | null
          requested_role: Database["public"]["Enums"]["user_role"]
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_reason?: string | null
          requested_business_id?: string | null
          requested_role?: Database["public"]["Enums"]["user_role"]
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_reason?: string | null
          requested_business_id?: string | null
          requested_role?: Database["public"]["Enums"]["user_role"]
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_access_requests_requested_business_id_fkey"
            columns: ["requested_business_id"]
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
      user_businesses: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_businesses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_business_module_access: {
        Args: { business_id_param: string; module_key_param: string }
        Returns: boolean
      }
      clone_employees_to_business: {
        Args: {
          from_business_id: string
          to_business_id: string
          created_by_user_id?: string
        }
        Returns: Json
      }
      create_custom_module_table: {
        Args: {
          module_id_param: string
          table_name_param: string
          fields_config: Json
        }
        Returns: boolean
      }
      delete_from_table: {
        Args: { table_name: string; where_clause: string }
        Returns: undefined
      }
      drop_custom_table: {
        Args: { table_name: string }
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
      get_business_modules: {
        Args: { business_id_param: string }
        Returns: {
          module_key: string
          is_enabled: boolean
          module_name: string
          description: string
          icon: string
          route_pattern: string
        }[]
      }
      get_next_customer_number: {
        Args: { business_id_param: string }
        Returns: number
      }
      get_user_business_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      insert_into_table: {
        Args: { table_name: string; columns_list: string; values_list: string }
        Returns: Json
      }
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      select_from_table: {
        Args: {
          table_name: string
          select_clause?: string
          where_clause?: string
        }
        Returns: Json
      }
      update_table: {
        Args: { table_name: string; set_clause: string; where_clause: string }
        Returns: Json
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
