import { supabase } from '@/integrations/supabase/client';

export class ActivityLogger {
  private static async log(action: string, targetType: string, targetId: string, details?: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user for activity logging');
        return;
      }

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          action,
          target_type: targetType,
          target_id: targetId,
          details: details || {},
          user_id: user.id
        });

      if (error) {
        console.error('Error logging activity:', error);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Employee activities
  static logEmployeeCreated(employeeId: string, employeeName: string) {
    return this.log('create', 'employee', employeeId, { employee_name: employeeName });
  }

  static logEmployeeUpdated(employeeId: string, employeeName: string) {
    return this.log('update', 'employee', employeeId, { employee_name: employeeName });
  }

  static logEmployeeDeleted(employeeId: string, employeeName: string) {
    return this.log('delete', 'employee', employeeId, { employee_name: employeeName });
  }

  static logEmployeeApproved(employeeId: string, employeeName: string) {
    return this.log('approve', 'employee', employeeId, { employee_name: employeeName });
  }

  static logEmployeeRejected(employeeId: string, employeeName: string) {
    return this.log('reject', 'employee', employeeId, { employee_name: employeeName });
  }

  static logEmployeeArchived(employeeId: string, employeeName: string) {
    return this.log('archive_employee_cleanup', 'employee', employeeId, { employee_name: employeeName });
  }

  // Business activities
  static logBusinessCreated(businessId: string, businessName: string) {
    return this.log('create', 'business', businessId, { business_name: businessName });
  }

  static logBusinessUpdated(businessId: string, businessName: string) {
    return this.log('update', 'business', businessId, { business_name: businessName });
  }

  // Shift activities
  static logShiftScheduled(shiftId: string, employeeName?: string, shiftDate?: string) {
    return this.log('schedule', 'shift', shiftId, { 
      employee_name: employeeName,
      shift_date: shiftDate 
    });
  }

  static logShiftApproved(shiftId: string, employeeName?: string) {
    return this.log('approve', 'shift', shiftId, { employee_name: employeeName });
  }

  static logShiftRejected(shiftId: string, employeeName?: string) {
    return this.log('reject', 'shift', shiftId, { employee_name: employeeName });
  }

  // General activities
  static logModuleEnabled(moduleKey: string, businessId: string) {
    return this.log('enable', 'module', moduleKey, { business_id: businessId });
  }

  static logModuleDisabled(moduleKey: string, businessId: string) {
    return this.log('disable', 'module', moduleKey, { business_id: businessId });
  }

  static logSettingsUpdated(settingType: string, businessId?: string) {
    return this.log('update', 'settings', settingType, { business_id: businessId });
  }

  // File activities
  static logFileUploaded(fileId: string, fileName: string, employeeId?: string) {
    return this.log('upload', 'file', fileId, { 
      file_name: fileName,
      employee_id: employeeId 
    });
  }

  static logFileApproved(fileId: string, fileName: string) {
    return this.log('approve', 'file', fileId, { file_name: fileName });
  }

  static logFileRejected(fileId: string, fileName: string) {
    return this.log('reject', 'file', fileId, { file_name: fileName });
  }
}