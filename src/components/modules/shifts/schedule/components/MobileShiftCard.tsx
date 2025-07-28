
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
      className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
        shift.is_new && showNewShifts ? 'border-r-4 border-r-primary bg-primary/5 border-primary/20' : 'border-border hover:border-primary/30'
      } ${
        isSelected ? 'bg-primary/10 border-primary shadow-md' : 'bg-white'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with time and status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-bold text-xl text-foreground">
                {shift.start_time} - {shift.end_time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {shift.is_new && showNewShifts && (
                <Badge variant="default" className="text-xs font-bold bg-primary text-primary-foreground">
                  חדש
                </Badge>
              )}
              <Badge 
                variant={
                  shift.status === 'approved' || shift.status === 'assigned' ? 'default' :
                  shift.status === 'pending' ? 'secondary' :
                  'destructive'
                }
                className="text-sm font-bold px-3 py-1"
              >
                {shift.status === 'approved' || shift.status === 'assigned' ? 'מאושר' : 
                 shift.status === 'pending' ? 'ממתין' : shift.status}
              </Badge>
            </div>
          </div>

          {/* Employee info */}
          <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg border border-border/50">
            <User className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-foreground">
              {getEmployeeName(shift.employee_id)}
            </span>
          </div>

          {/* Branch info */}
          <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg border border-border/50">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-foreground">
              {getBranchName(shift.branch_id)}
            </span>
          </div>

          {/* Role if exists */}
          {shift.role && (
            <div className="flex items-center gap-3 p-2 bg-accent/10 rounded-lg border border-accent/20">
              <Briefcase className="h-5 w-5 text-accent" />
              <Badge variant="outline" className="text-sm font-bold border-accent text-accent">
                {shift.role}
              </Badge>
            </div>
          )}

          {/* Notes if exist */}
          {shift.notes && (
            <div className="flex items-start gap-3 p-2 bg-warning/10 rounded-lg border border-warning/20">
              <MessageSquare className="h-5 w-5 text-warning mt-0.5" />
              <p className="text-sm font-medium text-foreground line-clamp-2">
                {shift.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
