
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, Filter, MoreVertical, Calendar, Users } from 'lucide-react';

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
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
        
        <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 ml-2" />
              משמרת חדשה
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowBulkCreator(true)}>
              <Calendar className="h-4 w-4 ml-2" />
              יצירה בכמות
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="h-4 w-4 mr-2" />
        {showFilters ? 'הסתר מסננים' : 'הצג מסננים'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCreateDialog(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        משמרת חדשה
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowBulkCreator(true)}
      >
        <Users className="h-4 w-4 mr-2" />
        יצירה בכמות
      </Button>
    </div>
  );
};
