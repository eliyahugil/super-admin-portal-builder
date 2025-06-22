
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, FileText, Settings, Upload, Download } from 'lucide-react';

interface ManagementToolsGridProps {
  businessId?: string | null;
}

export const ManagementToolsGrid: React.FC<ManagementToolsGridProps> = ({ businessId }) => {
  console.log('🔧 ManagementToolsGrid rendering with businessId:', businessId);

  const tools = [
    {
      title: 'ייבוא עובדים',
      description: 'ייבוא רשימת עובדים מקובץ Excel',
      icon: Upload,
      action: () => console.log('Import employees'),
      disabled: !businessId
    },
    {
      title: 'ייצוא נתונים',
      description: 'ייצוא נתוני עובדים לקובץ Excel',
      icon: Download,
      action: () => console.log('Export data'),
      disabled: !businessId
    },
    {
      title: 'ניהול תבניות משמרות',
      description: 'יצירה ועריכה של תבניות משמרות',
      icon: Calendar,
      action: () => console.log('Manage shift templates'),
      disabled: !businessId
    },
    {
      title: 'ניהול מסמכים',
      description: 'העלאה וניהול מסמכים לחתימה',
      icon: FileText,
      action: () => console.log('Manage documents'),
      disabled: !businessId
    },
    {
      title: 'הגדרות מתקדמות',
      description: 'הגדרות מערכת ותצורה מתקדמת',
      icon: Settings,
      action: () => console.log('Advanced settings'),
      disabled: !businessId
    },
  ];

  return (
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
            >
              {tool.disabled ? 'דורש בחירת עסק' : 'פתח'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
