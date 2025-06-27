
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Users, Search } from 'lucide-react';
import { EmployeeDuplicateManager } from '../EmployeeDuplicateManager';

export const DuplicateManagementCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-orange-600" />
          ניהול עובדים כפולים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">
          זהה ומזג עובדים כפולים במערכת
        </p>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2">
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
