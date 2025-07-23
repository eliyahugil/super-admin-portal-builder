
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, Filter, MoreVertical, Calendar, Users, Trash2, Edit, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DeleteAllShiftsButton } from '../../DeleteAllShiftsButton';
import { BulkWeekDeleteDialog } from './BulkWeekDeleteDialog';

interface ScheduleActionsProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  setShowCreateDialog: (show: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isMobile: boolean;
  // Bulk edit props
  isSelectionMode?: boolean;
  setIsSelectionMode?: (mode: boolean) => void;
  selectedShifts?: any[];
  onBulkEdit?: () => void;
  onBulkDelete?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  // Week delete callback
  onWeekDeleted?: () => void;
  // Business ID for bulk operations
  businessId?: string | null;
}

export const ScheduleActions: React.FC<ScheduleActionsProps> = ({
  showFilters,
  setShowFilters,
  setShowCreateDialog,
  mobileMenuOpen,
  setMobileMenuOpen,
  isMobile,
  isSelectionMode = false,
  setIsSelectionMode,
  selectedShifts = [],
  onBulkEdit,
  onBulkDelete,
  onSelectAll,
  onClearSelection,
  onWeekDeleted,
  businessId
}) => {
  
  if (isSelectionMode) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1">
          {selectedShifts.length} נבחרו
        </Badge>
        
        {selectedShifts.length > 0 && (
          <>
            <Button 
              onClick={onBulkEdit} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              ערוך
            </Button>
            <Button 
              onClick={onBulkDelete} 
              size="sm" 
              variant="destructive"
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              מחק
            </Button>
          </>
        )}
        
        <Button 
          onClick={onSelectAll} 
          size="sm" 
          variant="ghost"
        >
          בחר הכל
        </Button>
        
        <Button 
          onClick={onClearSelection} 
          size="sm" 
          variant="ghost"
        >
          בטל בחירה
        </Button>
      </div>
    );
  }

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
              יצירת משמרות
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setIsSelectionMode?.(true)}
              className="text-blue-700 focus:text-blue-800"
            >
              <CheckSquare className="h-4 w-4 ml-2" />
              עריכה מרובה
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BulkWeekDeleteDialog onSuccess={onWeekDeleted} businessId={businessId} />
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DeleteAllShiftsButton />
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
        יצירת משמרות
      </Button>
      <Button
        variant={isSelectionMode ? "default" : "outline"}
        size="sm"
        onClick={() => {
          console.log('🔄 Selection mode activated!');
          setIsSelectionMode?.(true);
        }}
        className={isSelectionMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-blue-300 text-blue-700 hover:bg-blue-50"}
      >
        <CheckSquare className="h-4 w-4 mr-2" />
        עריכה מרובה
      </Button>
      <BulkWeekDeleteDialog onSuccess={onWeekDeleted} businessId={businessId} />
      <DeleteAllShiftsButton />
    </div>
  );
};
