
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, FileText, Settings, Upload, Download } from 'lucide-react';
import { ImportManager } from '../ImportManager';
import { useToast } from '@/hooks/use-toast';

interface ManagementToolsGridProps {
  businessId?: string | null;
}

export const ManagementToolsGrid: React.FC<ManagementToolsGridProps> = ({ businessId }) => {
  console.log('🔧 ManagementToolsGrid rendering with businessId:', businessId);
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();

  const handleImportEmployees = () => {
    console.log('📥 Import employees clicked');
    setShowImport(true);
  };

  const handleExportData = () => {
    console.log('📤 Export data clicked');
    toast({
      title: 'ייצוא נתונים',
      description: 'הפיצר בפיתוח - יהיה זמין בקרוב',
    });
  };

  const handleShiftTemplates = () => {
    console.log('📅 Shift templates clicked');
    toast({
      title: 'ניהול תבניות משמרות',
      description: 'הפיצר בפיתוח - יהיה זמין בקרוב',
    });
  };

  const handleDocuments = () => {
    console.log('📄 Documents clicked');
    // Navigate to documents page
    window.location.href = '/modules/employees/employee-docs';
  };

  const handleAdvancedSettings = () => {
    console.log('⚙️ Advanced settings clicked');
    toast({
      title: 'הגדרות מתקדמות',
      description: 'הפיצר בפיתוח - יהיה זמין בקרוב',
    });
  };

  const tools = [
    {
      title: 'ייבוא עובדים',
      description: 'ייבוא רשימת עובדים מקובץ Excel',
      icon: Upload,
      action: handleImportEmployees,
      disabled: !businessId
    },
    {
      title: 'ייצוא נתונים',
      description: 'ייצוא נתוני עובדים לקובץ Excel',
      icon: Download,
      action: handleExportData,
      disabled: !businessId
    },
    {
      title: 'ניהול תבניות משמרות',
      description: 'יצירה ועריכה של תבניות משמרות',
      icon: Calendar,
      action: handleShiftTemplates,
      disabled: !businessId
    },
    {
      title: 'ניהול מסמכים',
      description: 'העלאה וניהול מסמכים לחתימה',
      icon: FileText,
      action: handleDocuments,
      disabled: !businessId
    },
    {
      title: 'הגדרות מתקדמות',
      description: 'הגדרות מערכת ותצורה מתקדמת',
      icon: Settings,
      action: handleAdvancedSettings,
      disabled: !businessId
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, index) => (
          <Card key={index} className={`hover:shadow-md transition-shadow ${tool.disabled ? 'opacity-50' : 'cursor-pointer'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <tool.icon className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">{tool.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-3 text-sm">
                {tool.description}
              </CardDescription>
              <Button 
                onClick={tool.action}
                disabled={tool.disabled}
                variant="outline" 
                size="sm" 
                className="w-full"
                type="button"
              >
                {tool.disabled ? 'דורש בחירת עסק' : 'פתח'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Import Dialog */}
      {showImport && (
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>ייבוא עובדים</CardTitle>
            </CardHeader>
            <CardContent>
              <ImportManager selectedBusinessId={businessId} />
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImport(false)}
                  type="button"
                >
                  סגור
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
