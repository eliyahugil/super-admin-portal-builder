import { supabase } from '@/integrations/supabase/client';

export interface ShiftDefinition {
  id: string;
  business_id: string;
  name: string;
  shift_type: 'morning' | 'afternoon' | 'evening' | 'night';
  start_time: string;
  end_time: string;
  color: string;
  min_submission_hours: number;
  is_active: boolean;
  display_order: number;
}

export interface SubmissionRule {
  id: string;
  business_id: string;
  name: string;
  rule_type: 'minimum_shifts' | 'maximum_shifts' | 'deadline_hours' | 'custom';
  value_numeric?: number;
  value_text?: string;
  description?: string;
  is_active: boolean;
}

export interface SystemMessage {
  id: string;
  business_id: string;
  message_key: string;
  title: string;
  content: string;
  message_type: 'token_header' | 'token_footer' | 'submission_success' | 'submission_error' | 'reminder' | 'notification';
  is_active: boolean;
}

export interface GeneralSetting {
  id: string;
  business_id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
}

export class SystemSettingsService {
  // === Shift Definitions ===
  static async getShiftDefinitions(businessId: string): Promise<ShiftDefinition[]> {
    const { data, error } = await supabase
      .from('shift_definitions')
      .select('*')
      .eq('business_id', businessId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching shift definitions:', error);
      throw error;
    }

    return (data || []) as ShiftDefinition[];
  }

  static async createShiftDefinition(shiftData: Omit<ShiftDefinition, 'id'>): Promise<ShiftDefinition> {
    const { data, error } = await supabase
      .from('shift_definitions')
      .insert(shiftData)
      .select()
      .single();

    if (error) {
      console.error('Error creating shift definition:', error);
      throw error;
    }

    return data as ShiftDefinition;
  }

  static async updateShiftDefinition(id: string, updates: Partial<ShiftDefinition>): Promise<ShiftDefinition> {
    const { data, error } = await supabase
      .from('shift_definitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating shift definition:', error);
      throw error;
    }

    return data as ShiftDefinition;
  }

  static async deleteShiftDefinition(id: string): Promise<void> {
    const { error } = await supabase
      .from('shift_definitions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting shift definition:', error);
      throw error;
    }
  }

  // === Submission Rules ===
  static async getSubmissionRules(businessId: string): Promise<SubmissionRule[]> {
    const { data, error } = await supabase
      .from('submission_rules')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching submission rules:', error);
      throw error;
    }

    return (data || []) as SubmissionRule[];
  }

  static async createSubmissionRule(ruleData: Omit<SubmissionRule, 'id'>): Promise<SubmissionRule> {
    const { data, error } = await supabase
      .from('submission_rules')
      .insert(ruleData)
      .select()
      .single();

    if (error) {
      console.error('Error creating submission rule:', error);
      throw error;
    }

    return data as SubmissionRule;
  }

  static async updateSubmissionRule(id: string, updates: Partial<SubmissionRule>): Promise<SubmissionRule> {
    const { data, error } = await supabase
      .from('submission_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating submission rule:', error);
      throw error;
    }

    return data as SubmissionRule;
  }

  static async deleteSubmissionRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('submission_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting submission rule:', error);
      throw error;
    }
  }

  // === System Messages ===
  static async getSystemMessages(businessId: string): Promise<SystemMessage[]> {
    const { data, error } = await supabase
      .from('system_messages')
      .select('*')
      .eq('business_id', businessId)
      .order('message_type', { ascending: true });

    if (error) {
      console.error('Error fetching system messages:', error);
      throw error;
    }

    return (data || []) as SystemMessage[];
  }

  static async getSystemMessage(businessId: string, messageKey: string): Promise<SystemMessage | null> {
    const { data, error } = await supabase
      .from('system_messages')
      .select('*')
      .eq('business_id', businessId)
      .eq('message_key', messageKey)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching system message:', error);
      throw error;
    }

    return (data as SystemMessage) || null;
  }

  static async createSystemMessage(messageData: Omit<SystemMessage, 'id'>): Promise<SystemMessage> {
    const { data, error } = await supabase
      .from('system_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Error creating system message:', error);
      throw error;
    }

    return data as SystemMessage;
  }

  static async updateSystemMessage(id: string, updates: Partial<SystemMessage>): Promise<SystemMessage> {
    const { data, error } = await supabase
      .from('system_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating system message:', error);
      throw error;
    }

    return data as SystemMessage;
  }

  static async deleteSystemMessage(id: string): Promise<void> {
    const { error } = await supabase
      .from('system_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting system message:', error);
      throw error;
    }
  }

  // === General Settings ===
  static async getGeneralSettings(businessId: string): Promise<GeneralSetting[]> {
    const { data, error } = await supabase
      .from('business_general_settings')
      .select('*')
      .eq('business_id', businessId)
      .order('setting_key', { ascending: true });

    if (error) {
      console.error('Error fetching general settings:', error);
      throw error;
    }

    return (data || []) as GeneralSetting[];
  }

  static async getGeneralSetting(businessId: string, settingKey: string): Promise<GeneralSetting | null> {
    const { data, error } = await supabase
      .from('business_general_settings')
      .select('*')
      .eq('business_id', businessId)
      .eq('setting_key', settingKey)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching general setting:', error);
      throw error;
    }

    return (data as GeneralSetting) || null;
  }

  static async setGeneralSetting(businessId: string, settingKey: string, settingValue: string, settingType: 'string' | 'number' | 'boolean' | 'json' = 'string', description?: string): Promise<GeneralSetting> {
    const { data, error } = await supabase
      .from('business_general_settings')
      .upsert({
        business_id: businessId,
        setting_key: settingKey,
        setting_value: settingValue,
        setting_type: settingType,
        description
      })
      .select()
      .single();

    if (error) {
      console.error('Error setting general setting:', error);
      throw error;
    }

    return data as GeneralSetting;
  }

  static async deleteGeneralSetting(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_general_settings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting general setting:', error);
      throw error;
    }
  }

  // === Helper Methods ===
  
  /**
   * Initialize default settings for a new business
   */
  static async initializeBusinessSettings(businessId: string): Promise<void> {
    try {
      // Create default shift definitions
      const defaultShifts: Omit<ShiftDefinition, 'id'>[] = [
        {
          business_id: businessId,
          name: 'משמרת בוקר',
          shift_type: 'morning',
          start_time: '06:00',
          end_time: '14:59',
          color: '#FEF3C7',
          min_submission_hours: 48,
          is_active: true,
          display_order: 1
        },
        {
          business_id: businessId,
          name: 'משמרת אחר צהריים',
          shift_type: 'afternoon',
          start_time: '15:00',
          end_time: '15:59',
          color: '#DBEAFE',
          min_submission_hours: 48,
          is_active: true,
          display_order: 2
        },
        {
          business_id: businessId,
          name: 'משמרת ערב',
          shift_type: 'evening',
          start_time: '16:00',
          end_time: '01:59',
          color: '#F3E8FF',
          min_submission_hours: 72,
          is_active: true,
          display_order: 3
        }
      ];

      // Create default submission rules
      const defaultRules: Omit<SubmissionRule, 'id'>[] = [
        {
          business_id: businessId,
          name: 'מינימום משמרות לעובד',
          rule_type: 'minimum_shifts',
          value_numeric: 2,
          description: 'כל עובד חייב להגיש לפחות 2 משמרות בשבוע',
          is_active: true
        },
        {
          business_id: businessId,
          name: 'מקסימום משמרות לעובד',
          rule_type: 'maximum_shifts',
          value_numeric: 6,
          description: 'עובד לא יכול להגיש יותר מ-6 משמרות בשבוע',
          is_active: true
        },
        {
          business_id: businessId,
          name: 'זמן סגירת הגשה (שעות)',
          rule_type: 'deadline_hours',
          value_numeric: 48,
          description: 'ההגשה נסגרת 48 שעות לפני תחילת השבוע',
          is_active: true
        }
      ];

      // Insert default shifts
      await supabase.from('shift_definitions').insert(defaultShifts);
      
      // Insert default rules
      await supabase.from('submission_rules').insert(defaultRules);

      console.log('✅ Default business settings initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing business settings:', error);
      throw error;
    }
  }

  /**
   * Get shift type definition by time
   */
  static getShiftTypeByTime(businessShiftDefinitions: ShiftDefinition[], time: string): ShiftDefinition | null {
    const hour = parseInt(time.split(':')[0]);
    const minutes = parseInt(time.split(':')[1]);
    const totalMinutes = hour * 60 + minutes;

    for (const shift of businessShiftDefinitions.filter(s => s.is_active)) {
      const startHour = parseInt(shift.start_time.split(':')[0]);
      const startMinutes = parseInt(shift.start_time.split(':')[1]);
      const startTotalMinutes = startHour * 60 + startMinutes;

      const endHour = parseInt(shift.end_time.split(':')[0]);
      const endMinutes = parseInt(shift.end_time.split(':')[1]);
      let endTotalMinutes = endHour * 60 + endMinutes;

      // Handle overnight shifts (e.g., 16:00 - 01:59)
      if (endTotalMinutes < startTotalMinutes) {
        endTotalMinutes += 24 * 60; // Add 24 hours
        if (totalMinutes < startTotalMinutes) {
          // Current time is after midnight, adjust it
          const adjustedTotalMinutes = totalMinutes + 24 * 60;
          if (adjustedTotalMinutes >= startTotalMinutes && adjustedTotalMinutes <= endTotalMinutes) {
            return shift;
          }
        }
      } else {
        // Regular shifts (same day)
        if (totalMinutes >= startTotalMinutes && totalMinutes <= endTotalMinutes) {
          return shift;
        }
      }
    }

    return null;
  }
}