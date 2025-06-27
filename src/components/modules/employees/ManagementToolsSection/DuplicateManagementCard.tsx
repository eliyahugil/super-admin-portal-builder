
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Users, Search, AlertTriangle } from 'lucide-react';
import { EmployeeDuplicateManager } from '../EmployeeDuplicateManager';

export const DuplicateManagementCard: React.FC = () => {
  console.log('🔍 DuplicateManagementCard rendering');
  
  return (
    <Card className="border-2 border-orange-300 bg-orange-50 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-orange-800">
          <Users className="h-5 w-5 text-orange-600" />
          ניהול עובדים כפולים
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-orange-700 font-medium">
          זהה ומזג עובדים כפולים במערכת
        </p>
        
        <div className="bg-orange-100 p-3 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-600 mb-2">
            כלי חשוב לניקוי בסיס הנתונים מעובדים כפולים
          </p>
          <ul className="text-xs text-orange-600 space-y-1">
            <li>• זיהוי אוטומטי של עובדים עם נתונים דומים</li>
            <li>• מיזוג בטוח של נתונים</li>
            <li>• העברת עובדים כפולים לארכיון</li>
          </ul>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="default" 
              className="w-full flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Search className="h-4 w-4" />
              חפש עובדים כפולים
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <EmployeeDuplicateManager />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
