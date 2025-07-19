import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  Users, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Brain,
  Zap,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { SmartSchedulingAlgorithm } from './advanced-scheduling/SmartSchedulingAlgorithm';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface AssignmentRule {
  id: string;
  name: string;
  priority: number;
  isActive: boolean;
  criteria: {
    availability: boolean;
    experience: boolean;
    workload: boolean;
    preferences: boolean;
  };
}

export const AutoShiftAssignment: React.FC = () => {
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [assignmentMode, setAssignmentMode] = useState<'automatic' | 'suggest'>('suggest');
  const [selectedWeek, setSelectedWeek] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [algorithmType, setAlgorithmType] = useState<'basic' | 'advanced' | 'ai_optimized'>('advanced');
  const [lastResult, setLastResult] = useState<any>(null);
  
  const [rules, setRules] = useState<AssignmentRule[]>([
    {
      id: '1',
      name: 'עדיפות לעובדים זמינים',
      priority: 1,
      isActive: true,
      criteria: {
        availability: true,
        experience: false,
        workload: false,
        preferences: false
      }
    },
    {
      id: '2', 
      name: 'איזון עומס עבודה',
      priority: 2,
      isActive: true,
      criteria: {
        availability: false,
        experience: false,
        workload: true,
        preferences: false
      }
    },
    {
      id: '3',
      name: 'התאמה להעדפות עובדים',
      priority: 3,
      isActive: false,
      criteria: {
        availability: false,
        experience: false,
        workload: false,
        preferences: true
      }
    }
  ]);

  const [stats, setStats] = useState({
    totalShifts: 0,
    assignedShifts: 0,
    unassignedShifts: 0,
    conflictingShifts: 0
  });

  const handleRunAssignment = async () => {
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מזהה עסק תקין',
        variant: 'destructive'
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    
    try {
      const algorithm = new SmartSchedulingAlgorithm(businessId);
      
      // חישוב תאריכי השבוע
      const weekStart = startOfWeek(new Date(selectedWeek), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(new Date(selectedWeek), { weekStartsOn: 0 });
      
      // עדכון התקדמות
      setProgress(20);
      
      // טעינת נתונים
      await algorithm.loadData(
        format(weekStart, 'yyyy-MM-dd'),
        format(weekEnd, 'yyyy-MM-dd')
      );
      
      setProgress(50);
      
      // יצירת סידור
      const result = await algorithm.generateSchedule(algorithmType);
      
      setProgress(80);
      
      // שמירה אם במצב אוטומטי
      if (assignmentMode === 'automatic' && result.success) {
        await algorithm.saveSchedule(result.assignments);
      }
      
      setProgress(100);
      
      // עדכון תוצאות
      setLastResult(result);
      setStats({
        totalShifts: result.statistics.total_shifts,
        assignedShifts: result.statistics.assigned_shifts,
        unassignedShifts: result.statistics.total_shifts - result.statistics.assigned_shifts,
        conflictingShifts: result.conflicts.length
      });
      
      toast({
        title: result.success ? 'השיוך הושלם בהצלחה' : 'השיוך הושלם עם קונפליקטים',
        description: `שוייכו ${result.assignments.length} משמרות, ${result.conflicts.length} קונפליקטים`,
        variant: result.success ? 'default' : 'destructive'
      });
      
    } catch (error) {
      console.error('שגיאה בסידור אוטומטי:', error);
      toast({
        title: 'שגיאה בסידור אוטומטי',
        description: 'אנא נסה שוב או פנה לתמיכה',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
  };

  const handleChangeAssignment = async (shiftId: string, currentEmployeeId: string, newEmployeeId: string) => {
    try {
      // עדכון התוצאה במצב המקומי
      setLastResult((prev: any) => ({
        ...prev,
        assignments: prev.assignments.map((assignment: any) => 
          assignment.shift_id === shiftId 
            ? { ...assignment, employee_id: newEmployeeId } 
            : assignment
        )
      }));

      toast({
        title: 'השיוך עודכן',
        description: 'השיוך עודכן בהצלחה במצב הצגה. לשמירה סופית, הפעל שוב את השיוך במצב אוטומטי.',
        variant: 'default'
      });
    } catch (error) {
      console.error('שגיאה בעדכון השיוך:', error);
      toast({
        title: 'שגיאה בעדכון השיוך',
        description: 'לא הצלחנו לעדכן את השיוך',
        variant: 'destructive'
      });
    }
  };

  const getAssignmentRatio = () => {
    return Math.round((stats.assignedShifts / stats.totalShifts) * 100);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            שיוך אוטומטי של משמרות
          </h2>
          <p className="text-gray-600">אלגוריתם חכם לשיוך משמרות לעובדים</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="week"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          
          <Select value={algorithmType} onValueChange={(value: any) => setAlgorithmType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="basic">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  בסיסי
                </div>
              </SelectItem>
              <SelectItem value="advanced">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  מתקדם
                </div>
              </SelectItem>
              <SelectItem value="ai_optimized">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI מאופטם
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
           <Select value={assignmentMode} onValueChange={(value: any) => setAssignmentMode(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="suggest">הצע שיוכים</SelectItem>
              <SelectItem value="automatic">שיוך אוטומטי</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleRunAssignment}
            disabled={isRunning || !businessId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                מעבד...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                הפעל שיוך
              </>
            )}
          </Button>
        </div>
      </div>

      {/* הגדרות כמויות משמרות לפי עובדים */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            הגדרות כמויות משמרות לפי עובדים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="use-employee-hours" />
              <label htmlFor="use-employee-hours" className="text-sm font-medium">
                התאמה לשעות שבועיות נדרשות
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="balance-workload" />
              <label htmlFor="balance-workload" className="text-sm font-medium">
                איזון עומס עבודה בין עובדים
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="respect-preferences" />
              <label htmlFor="respect-preferences" className="text-sm font-medium">
                כבוד להעדפות עובדים
              </label>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">מגבלות שעות עבודה</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">מינימום שעות לעובד בשבוע</label>
                <input 
                  type="number" 
                  className="w-full mt-1 px-3 py-2 border rounded-md" 
                  placeholder="0" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">מקסימום שעות לעובד בשבוע</label>
                <input 
                  type="number" 
                  className="w-full mt-1 px-3 py-2 border rounded-md" 
                  placeholder="50" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* סטטיסטיקות כלליות */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">סה"כ משמרות</p>
                <p className="text-2xl font-bold">{stats.totalShifts}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">משמרות משוייכות</p>
                <p className="text-2xl font-bold text-green-600">{stats.assignedShifts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">משמרות פנויות</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unassignedShifts}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">קונפליקטים</p>
                <p className="text-2xl font-bold text-red-600">{stats.conflictingShifts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* אחוז השיוך */}
      <Card>
        <CardHeader>
          <CardTitle>אחוז השיוך הכללי</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {stats.assignedShifts} מתוך {stats.totalShifts} משמרות
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {getAssignmentRatio()}%
              </span>
            </div>
            <Progress value={getAssignmentRatio()} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* התקדמות השיוך */}
      {isRunning && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">מעבד שיוך אוטומטי...</span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600">
                בודק זמינות עובדים ומבצע שיוכים אופטימליים
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* תוצאות הסידור האחרון */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              תוצאות הסידור האחרון
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">שיוכים שבוצעו ({lastResult.assignments.length})</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {lastResult.assignments.slice(0, 5).map((assignment: any, index: number) => (
                    <div key={index} className="text-sm p-3 bg-green-50 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">משמרת {assignment.shift_id.slice(-8)}</div>
                        {assignment.alternativeOptions && assignment.alternativeOptions.length > 0 && (
                          <Select
                            defaultValue={assignment.employee_id}
                            onValueChange={(newEmployeeId) => handleChangeAssignment(assignment.shift_id, assignment.employee_id, newEmployeeId)}
                          >
                            <SelectTrigger className="w-32 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border shadow-lg z-50">
                              <SelectItem value={assignment.employee_id}>
                                <div className="text-xs">
                                  {assignment.employee_name} (נוכחי)
                                </div>
                              </SelectItem>
                              {assignment.alternativeOptions.map((alt: any) => (
                                <SelectItem key={alt.employee_id} value={alt.employee_id}>
                                  <div className="text-xs">
                                    {alt.employee_name} ({alt.match_score}%)
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="text-gray-600">{assignment.reasoning}</div>
                      <div className="text-xs text-green-600">ציון: {assignment.confidence_score}</div>
                    </div>
                  ))}
                  {lastResult.assignments.length > 5 && (
                    <div className="text-sm text-gray-500">ועוד {lastResult.assignments.length - 5} שיוכים...</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">קונפליקטים ({lastResult.conflicts.length})</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {lastResult.conflicts.slice(0, 3).map((conflict: any, index: number) => (
                    <div key={index} className="text-sm p-2 bg-red-50 rounded border">
                      <div className="font-medium text-red-700">{conflict.issue}</div>
                      <div className="text-xs text-gray-600">
                        הצעות: {conflict.suggestions.join(', ')}
                      </div>
                    </div>
                  ))}
                  {lastResult.conflicts.length > 3 && (
                    <div className="text-sm text-gray-500">ועוד {lastResult.conflicts.length - 3} קונפליקטים...</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* המלצות למשמרות לא משויכות */}
            {lastResult.statistics.total_shifts > lastResult.assignments.length && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  המלצות למשמרות לא משויכות ({lastResult.statistics.total_shifts - lastResult.assignments.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* כאן נציג דמה של משמרות לא משויכות - יש לעדכן באלגוריתם */}
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-orange-800">משמרת ללא שיוך</div>
                        <div className="text-sm text-orange-600">08:00 - 16:00 | בוקר</div>
                      </div>
                      <Button size="sm" variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Brain className="h-3 w-3 mr-1" />
                        המלצות
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">ציון שביעות רצון כללי:</span>
                <Badge 
                  variant={lastResult.statistics.employee_satisfaction_score > 70 ? "default" : "destructive"}
                  className="text-lg px-3 py-1"
                >
                  {lastResult.statistics.employee_satisfaction_score}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* כללי השיוך */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            כללי השיוך האוטומטי
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    עדיפות {rule.priority}
                  </Badge>
                  <span className="font-medium">{rule.name}</span>
                </div>
                <div className="flex gap-1">
                  {rule.criteria.availability && (
                    <Badge variant="secondary" className="text-xs">זמינות</Badge>
                  )}
                  {rule.criteria.experience && (
                    <Badge variant="secondary" className="text-xs">ניסיון</Badge>
                  )}
                  {rule.criteria.workload && (
                    <Badge variant="secondary" className="text-xs">עומס</Badge>
                  )}
                  {rule.criteria.preferences && (
                    <Badge variant="secondary" className="text-xs">העדפות</Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant={rule.isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRule(rule.id)}
              >
                {rule.isActive ? 'פעיל' : 'לא פעיל'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};