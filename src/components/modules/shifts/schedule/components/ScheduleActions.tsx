
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Filter, 
  Download, 
  Copy, 
  Menu 
} from 'lucide-react';

interface ScheduleActionsProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  setShowCreateDialog: (show: boolean) => void;
  setShowBulkCreator: (show: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isMobile: boolean;
}

export const ScheduleActions: React.FC<ScheduleActionsProps> = ({
  showFilters,
  setShowFilters,
  setShowCreateDialog,
  setShowBulkCreator,
  mobileMenuOpen,
  setMobileMenuOpen,
  isMobile
}) => {
  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        {mobileMenuOpen && (
          <Card className="p-4 space-y-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => {
                setShowFilters(!showFilters);
                setMobileMenuOpen(false);
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              מסננים
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              יצוא
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setShowBulkCreator(true);
                setMobileMenuOpen(false);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              יצירה בכמות
            </Button>
            <Button 
              className="w-full justify-start"
              onClick={() => {
                setShowCreateDialog(true);
                setMobileMenuOpen(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              משמרת חדשה
            </Button>
          </Card>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={showFilters ? "default" : "outline"}
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="mr-2 h-4 w-4" />
        מסננים
      </Button>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        יצוא
      </Button>
      <Button
        variant="outline"
        onClick={() => setShowBulkCreator(true)}
      >
        <Copy className="mr-2 h-4 w-4" />
        יצירה בכמות
      </Button>
      <Button onClick={() => setShowCreateDialog(true)}>
        <Plus className="mr-2 h-4 w-4" />
        משמרת חדשה
      </Button>
    </div>
  );
};
