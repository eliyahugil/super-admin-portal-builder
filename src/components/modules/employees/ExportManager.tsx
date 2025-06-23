
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ExportManagerProps {
  businessId?: string | null;
  employees?: any[];
}

export const ExportManager: React.FC<ExportManagerProps> = ({ businessId, employees }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportEmployees = async () => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'נדרש לבחור עסק לייצוא',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    console.log('📤 Starting employee export for business:', businessId);

    try {
      // Fetch employees data with branches
      const { data: employeesData, error } = await supabase
        .from('employees')
        .select(`
          *,
          main_branch:branches!employees_main_branch_id_fkey(name),
          branch_assignments(
            branch:branches(name)
          )
        `)
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error fetching employees:', error);
        throw error;
      }

      if (!employeesData || employeesData.length === 0) {
        toast({
          title: 'אין נתונים לייצוא',
          description: 'לא נמצאו עובדים פעילים לייצוא',
        });
        return;
      }

      // Transform data for Excel export
      const exportData = employeesData.map(employee => ({
        'מזהה עובד': employee.employee_id || '',
        'שם פרטי': employee.first_name || '',
        'שם משפחה': employee.last_name || '',
        'אימייל': employee.email || '',
        'טלפון': employee.phone || '',
        'תעודת זהות': employee.id_number || '',
        'כתובת': employee.address || '',
        'תאריך התחלה': employee.hire_date || '',
        'סוג עובד': employee.employee_type || '',
        'שעות שבועיות': employee.weekly_hours_required || 0,
        'סניף ראשי': employee.main_branch?.name || '',
        'הערות': employee.notes || '',
        'סטטוס': employee.is_active ? 'פעיל' : 'לא פעיל'
      }));

      // Create Excel workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'עובדים');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `employees_export_${currentDate}.xlsx`;

      // Download the file
      XLSX.writeFile(wb, filename);

      console.log('✅ Export completed successfully');
      toast({
        title: 'ייצוא הושלם',
        description: `יוצאו ${employeesData.length} עובדים בהצלחה`,
      });

    } catch (error) {
      console.error('💥 Export error:', error);
      toast({
        title: 'שגיאה בייצוא',
        description: 'אירעה שגיאה בייצוא הנתונים',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          ייצוא נתוני עובדים
        </CardTitle>
        <CardDescription>
          ייצוא רשימת עובדים לקובץ Excel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>הייצוא יכלול את כל העובדים הפעילים</span>
        </div>
        
        <Button 
          onClick={handleExportEmployees}
          disabled={isExporting || !businessId}
          className="w-full flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isExporting ? 'מייצא...' : 'ייצא לאקסל'}
        </Button>
      </CardContent>
    </Card>
  );
};
