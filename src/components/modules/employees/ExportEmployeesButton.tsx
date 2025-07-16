import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

export const ExportEmployeesButton: React.FC = () => {
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();

  const handleExport = async () => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא עסק פעיל',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('📊 Starting employees export for business:', businessId);

      // Fetch all employees for the business
      const { data: employees, error } = await supabase
        .from('employees')
        .select(`
          first_name,
          last_name,
          email,
          phone,
          employee_id,
          id_number,
          employee_type,
          hire_date,
          is_active,
          is_archived,
          weekly_hours_required,
          address,
          notes
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching employees:', error);
        throw error;
      }

      if (!employees || employees.length === 0) {
        toast({
          title: 'אין נתונים',
          description: 'לא נמצאו עובדים לייצוא',
          variant: 'destructive',
        });
        return;
      }

      // Prepare data for export
      const exportData = employees.map(emp => ({
        'שם פרטי': emp.first_name || '',
        'שם משפחה': emp.last_name || '',
        'אימייל': emp.email || '',
        'טלפון': emp.phone || '',
        'מספר עובד': emp.employee_id || '',
        'תעודת זהות': emp.id_number || '',
        'סוג עובד': emp.employee_type || '',
        'תאריך התחלה': emp.hire_date || '',
        'פעיל': emp.is_active ? 'כן' : 'לא',
        'בארכיון': emp.is_archived ? 'כן' : 'לא',
        'שעות שבועיות נדרשות': emp.weekly_hours_required || '',
        'כתובת': emp.address || '',
        'הערות': emp.notes || ''
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // שם פרטי
        { wch: 15 }, // שם משפחה
        { wch: 25 }, // אימייל
        { wch: 15 }, // טלפון
        { wch: 12 }, // מספר עובד
        { wch: 12 }, // תעודת זהות
        { wch: 10 }, // סוג עובד
        { wch: 12 }, // תאריך התחלה
        { wch: 8 },  // פעיל
        { wch: 8 },  // בארכיון
        { wch: 15 }, // שעות שבועיות
        { wch: 30 }, // כתובת
        { wch: 30 }  // הערות
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'עובדים');

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `עובדים_${dateStr}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      console.log('✅ Employees exported successfully');
      toast({
        title: 'הצלחה',
        description: `נתוני ${employees.length} עובדים יוצאו בהצלחה`,
      });

    } catch (error) {
      console.error('❌ Error exporting employees:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לייצא את נתוני העובדים',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button 
      onClick={handleExport}
      variant="outline" 
      size="sm"
      className="gap-2"
      data-export-employees
    >
      <Download className="h-4 w-4" />
      ייצא לאקסל
    </Button>
  );
};