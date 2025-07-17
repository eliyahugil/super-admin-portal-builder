
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Archive, 
  ChevronDown, 
  Edit, 
  Mail, 
  MessageSquare, 
  UserCheck, 
  UserX,
  Building2,
  DollarSign,
  Clock,
  Calendar
} from 'lucide-react';
import { BulkEditEmployeesDialog } from './BulkEditEmployeesDialog';
import { BulkAssignBranchDialog } from './BulkAssignBranchDialog';
import { BulkSendMessageDialog } from './BulkSendMessageDialog';
import { BulkShiftTypesDialog } from './BulkShiftTypesDialog';
import type { Employee } from '@/types/employee';
import type { Branch } from '@/types/branch';

interface BulkEmployeeActionsProps {
  selectedEmployees: Set<string>;
  employees: Employee[];
  branches?: Branch[];
  onBulkDelete: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onRefetch: () => void;
  loading: boolean;
}

export const BulkEmployeeActions: React.FC<BulkEmployeeActionsProps> = ({
  selectedEmployees,
  employees,
  branches = [],
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  onRefetch,
  loading
}) => {
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showBranchAssign, setShowBranchAssign] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [showShiftTypes, setShowShiftTypes] = useState(false);

  const selectedCount = selectedEmployees.size;
  const selectedEmployeesList = employees.filter(emp => selectedEmployees.has(emp.id));

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <span className="text-sm font-medium text-blue-900">
          נבחרו {selectedCount} עובדים
        </span>
        
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkEdit(true)}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            עריכה גורפת
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShiftTypes(true)}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            סוגי משמרות
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSendMessage(true)}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            שליחת הודעה
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading}>
                פעולות נוספות
                <ChevronDown className="h-4 w-4 mr-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowBranchAssign(true)}>
                <Building2 className="h-4 w-4 ml-2" />
                שיוך לסניף
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={onBulkActivate}>
                <UserCheck className="h-4 w-4 ml-2" />
                הפעלת עובדים
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={onBulkDeactivate}>
                <UserX className="h-4 w-4 ml-2" />
                השבתת עובדים
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={onBulkDelete}
                className="text-orange-600 focus:text-orange-700"
              >
                <Archive className="h-4 w-4 ml-2" />
                העברה לארכיון
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialogs */}
      {showBulkEdit && (
        <BulkEditEmployeesDialog
          employees={selectedEmployeesList}
          branches={branches}
          open={showBulkEdit}
          onOpenChange={setShowBulkEdit}
          onSuccess={() => {
            setShowBulkEdit(false);
            onRefetch();
          }}
        />
      )}

      {showBranchAssign && (
        <BulkAssignBranchDialog
          employeeIds={Array.from(selectedEmployees)}
          branches={branches}
          open={showBranchAssign}
          onOpenChange={setShowBranchAssign}
          onSuccess={() => {
            setShowBranchAssign(false);
            onRefetch();
          }}
        />
      )}

      {showSendMessage && (
        <BulkSendMessageDialog
          employees={selectedEmployeesList}
          open={showSendMessage}
          onOpenChange={setShowSendMessage}
          onSuccess={() => {
            setShowSendMessage(false);
          }}
        />
      )}

      {showShiftTypes && (
        <BulkShiftTypesDialog
          employees={selectedEmployeesList}
          open={showShiftTypes}
          onOpenChange={setShowShiftTypes}
          onSuccess={() => {
            setShowShiftTypes(false);
            onRefetch();
          }}
        />
      )}
    </>
  );
};
