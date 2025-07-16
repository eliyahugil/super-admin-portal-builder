import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';
import type { ShiftScheduleData, Branch } from '../types';

interface ShiftPriorityManagerProps {
  shifts: ShiftScheduleData[];
  branches: Branch[];
  selectedDate: Date;
}

interface ShiftPriorityInfo {
  shift: ShiftScheduleData;
  branch: Branch;
  priorityLevel: 'critical' | 'normal' | 'reinforcement';
  assignedEmployees: number;
  requiredEmployees: number;
  isFullyStaffed: boolean;
}

export const ShiftPriorityManager: React.FC<ShiftPriorityManagerProps> = ({
  shifts,
  branches,
  selectedDate
}) => {
  const dateStr = selectedDate.toISOString().split('T')[0];
  
  // Filter shifts for the selected date
  const dayShifts = shifts.filter(shift => shift.shift_date === dateStr);
  
  // Group shifts by branch and time slot
  const shiftGroups = dayShifts.reduce((groups, shift) => {
    const key = `${shift.branch_id}-${shift.start_time}-${shift.end_time}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(shift);
    return groups;
  }, {} as Record<string, ShiftScheduleData[]>);

  // Analyze priority for each shift group
  const priorityAnalysis: ShiftPriorityInfo[] = Object.entries(shiftGroups).map(([key, groupShifts]) => {
    const [branchId, startTime, endTime] = key.split('-');
    const branch = branches.find(b => b.id === branchId);
    const mainShift = groupShifts[0]; // Use first shift as representative
    
    const assignedEmployees = groupShifts.filter(s => s.employee_id && s.status === 'approved').length;
    const requiredEmployees = mainShift.required_employees || 1;
    const isFullyStaffed = assignedEmployees >= requiredEmployees;
    
    let priorityLevel: 'critical' | 'normal' | 'reinforcement' = 'normal';
    
    if (assignedEmployees === 0) {
      priorityLevel = 'critical'; // No coverage at all
    } else if (assignedEmployees < requiredEmployees) {
      priorityLevel = 'normal'; // Partial coverage, needs basic staffing
    } else if (assignedEmployees >= requiredEmployees) {
      priorityLevel = 'reinforcement'; // Basic staffing complete, can add reinforcements
    }

    return {
      shift: mainShift,
      branch: branch!,
      priorityLevel,
      assignedEmployees,
      requiredEmployees,
      isFullyStaffed
    };
  }).filter(info => info.branch); // Filter out shifts without valid branches

  // Sort by priority: critical first, then normal, then reinforcement
  const sortedPriorities = priorityAnalysis.sort((a, b) => {
    const priorityOrder = { critical: 0, normal: 1, reinforcement: 2 };
    return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
  });

  const getPriorityColor = (level: 'critical' | 'normal' | 'reinforcement') => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reinforcement':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityIcon = (level: 'critical' | 'normal' | 'reinforcement') => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'normal':
        return <Users className="h-4 w-4" />;
      case 'reinforcement':
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPriorityText = (level: 'critical' | 'normal' | 'reinforcement') => {
    switch (level) {
      case 'critical':
        return 'דרושה כיסוי דחוף';
      case 'normal':
        return 'השלמת איוש בסיסי';
      case 'reinforcement':
        return 'זמין לתגבור';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5" />
          סדר עדיפויות איוש משמרות
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          המערכת מציגה את סדר העדיפויות למילוי משמרות בהתבסס על כמות העובדים הנדרשים
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedPriorities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">אין משמרות לתאריך זה</p>
        ) : (
          sortedPriorities.map((info, index) => (
            <div
              key={`${info.shift.id}-${index}`}
              className={`p-3 rounded-lg border ${getPriorityColor(info.priorityLevel)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(info.priorityLevel)}
                  <span className="font-medium">{info.branch.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {info.shift.start_time} - {info.shift.end_time}
                  </Badge>
                  {info.shift.role && (
                    <Badge variant="secondary" className="text-xs">
                      {info.shift.role}
                    </Badge>
                  )}
                </div>
                <Badge className={getPriorityColor(info.priorityLevel)}>
                  {getPriorityText(info.priorityLevel)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span>
                    עובדים מוקצים: <span className="font-medium">{info.assignedEmployees}</span>
                  </span>
                  <span>
                    נדרשים: <span className="font-medium">{info.requiredEmployees}</span>
                  </span>
                  <span>
                    חסרים: <span className={`font-medium ${info.assignedEmployees < info.requiredEmployees ? 'text-red-600' : 'text-green-600'}`}>
                      {Math.max(0, info.requiredEmployees - info.assignedEmployees)}
                    </span>
                  </span>
                </div>
                
                {info.isFullyStaffed && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ✓ איוש מלא
                  </Badge>
                )}
              </div>
              
              {info.priorityLevel === 'reinforcement' && (
                <p className="text-xs text-green-700 mt-2">
                  ניתן להוסיף עובדי תגבור לסניף זה
                </p>
              )}
            </div>
          ))
        )}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm text-blue-800 mb-2">הסבר סדר עדיפויות:</h4>
          <div className="space-y-1 text-xs text-blue-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              <span><strong>דחוף:</strong> משמרות ללא כיסוי כלל</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span><strong>רגיל:</strong> השלמת איוש בסיסי נדרש</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              <span><strong>תגבור:</strong> איוש בסיסי הושלם, ניתן להוסיף תגבורים</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};