
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MapPin, Briefcase, MessageSquare } from 'lucide-react';

interface MobileShiftCardProps {
  shift: any;
  getEmployeeName: (employeeId: string | null) => string;
  getBranchName: (branchId: string | null) => string;
  onClick: () => void;
  isSelected?: boolean;
  showNewShifts: boolean;
}

export const MobileShiftCard: React.FC<MobileShiftCardProps> = ({
  shift,
  getEmployeeName,
  getBranchName,
  onClick,
  isSelected = false,
  showNewShifts
}) => {
  return (
    <Card 
      className={`mb-3 cursor-pointer transition-colors hover:bg-gray-50 ${
        shift.is_new && showNewShifts ? 'border-r-4 border-r-blue-500 bg-blue-50' : ''
      } ${
        isSelected ? 'bg-blue-100 border-blue-300' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with time and status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-lg">
                {shift.start_time} - {shift.end_time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {shift.is_new && showNewShifts && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  חדש
                </Badge>
              )}
              <Badge 
                variant={
                  shift.status === 'approved' ? 'default' :
                  shift.status === 'pending' ? 'secondary' :
                  'destructive'
                }
                className="text-xs"
              >
                {shift.status === 'approved' ? 'מאושר' : 
                 shift.status === 'pending' ? 'ממתין' : shift.status}
              </Badge>
            </div>
          </div>

          {/* Employee info */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">
              {getEmployeeName(shift.employee_id)}
            </span>
          </div>

          {/* Branch info */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {getBranchName(shift.branch_id)}
            </span>
          </div>

          {/* Role if exists */}
          {shift.role && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <Badge variant="outline" className="text-xs">
                {shift.role}
              </Badge>
            </div>
          )}

          {/* Notes if exist */}
          {shift.notes && (
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
              <p className="text-sm text-gray-600 line-clamp-2">
                {shift.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
