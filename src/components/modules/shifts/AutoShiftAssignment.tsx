
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Clock 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [assignmentMode, setAssignmentMode] = useState<'automatic' | 'suggest'>('suggest');
  
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
    totalShifts: 156,
    assignedShifts: 89,
    unassignedShifts: 67,
    conflictingShifts: 12
  });

  const handleRunAssignment = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // סימולציה של תהליך השיוך
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          
          // עדכון סטטיסטיקות אחרי השיוך
          setStats(prev => ({
            ...prev,
            assignedShifts: prev.assignedShifts + 15,
            unassignedShifts: prev.unassignedShifts - 15
          }));
          
          toast({
            title: 'השיוך הושלם בהצלחה',
            description: `שוייכו 15 משמרות נוספות לעובדים זמינים`,
          });
          
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 500);
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
            disabled={isRunning}
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
                    עדיফות {rule.priority}
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
