
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

interface SuperAdminEmptyStateProps {
  onCreateBusiness: () => void;
}

export const SuperAdminEmptyState: React.FC<SuperAdminEmptyStateProps> = ({ onCreateBusiness }) => {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 overflow-hidden">
      <CardContent className="text-center py-12 px-6" dir="rtl">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-xl">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto opacity-20 animate-pulse"></div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          🏢 עדיין אין עסקים במערכת
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
          זהו הזמן להתחיל! צור את העסק הראשון שלך ותתחיל לנהל אותו בצורה מקצועית ויעילה
        </p>
        
        <Button 
          onClick={onCreateBusiness}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 px-8"
        >
          <Building2 className="h-5 w-5 ml-2" />
          צור עסק חדש
        </Button>
        
        <div className="mt-8 text-xs text-gray-500">
          💡 טיפ: אחרי יצירת העסק תוכל להוסיף עובדים, לנהל משמרות ועוד
        </div>
      </CardContent>
    </Card>
  );
};
