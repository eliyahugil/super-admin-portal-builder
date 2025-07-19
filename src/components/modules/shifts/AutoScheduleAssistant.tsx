import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, CheckCircle, AlertTriangle, Users, Clock, RefreshCw, Undo2 } from 'lucide-react';
import { useEmployeeRecommendations } from '@/hooks/useEmployeeRecommendations';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { toast } from 'sonner';

interface AutoAssignmentResult {
  shiftId: string;
  shiftTime: string;
  employeeId: string;
  employeeName: string;
  matchScore: number;
  success: boolean;
  reason?: string;
}

interface AutoScheduleAssistantProps {
  weekStartDate: string;
  emptyShifts: any[];
  onShiftUpdate: (shiftId: string, updates: any) => Promise<void>;
}

export const AutoScheduleAssistant: React.FC<AutoScheduleAssistantProps> = ({
  weekStartDate,
  emptyShifts,
  onShiftUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [results, setResults] = useState<AutoAssignmentResult[]>([]);
  const { businessId } = useCurrentBusiness();

  console.log('🔧 AutoScheduleAssistant rendered with:', { 
    businessId, 
    weekStartDate, 
    emptyShiftsCount: emptyShifts.length 
   });

  const { data: recommendations, isLoading, refetch } = useEmployeeRecommendations(
    businessId || '',
    weekStartDate
  );

  const handleRefresh = async () => {
    console.log('🔄 Refreshing recommendations...');
    await refetch();
    toast.success('ההמלצות עודכנו');
  };

  const handleCancelAssignments = async () => {
    if (results.length === 0) return;
    
    setIsCancelling(true);
    try {
      const successfulAssignments = results.filter(r => r.success);
      
      for (const assignment of successfulAssignments) {
        await onShiftUpdate(assignment.shiftId, { employee_id: null });
      }
      
      setResults([]);
      toast.success(`${successfulAssignments.length} שיבוצים בוטלו בהצלחה`);
    } catch (error) {
      toast.error('שגיאה בביטול השיבוצים');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAutoAssign = async () => {
    console.log('🪄 Auto assign clicked!', { 
      recommendations, 
      emptyShifts: emptyShifts.length,
      businessId,
      weekStartDate 
    });
    
    if (!recommendations || emptyShifts.length === 0) {
      console.log('❌ Cannot proceed:', { recommendations: !!recommendations, emptyShifts: emptyShifts.length });
      return;
    }

    setIsProcessing(true);
    const assignmentResults: AutoAssignmentResult[] = [];

    try {
      const assignedEmployees = new Set<string>(); // מעקב אחר עובדים שכבר שובצו
      
      for (const shift of emptyShifts) {
        const shiftRecommendations = recommendations.find(r => r.shiftId === shift.id);
        
        if (shiftRecommendations && shiftRecommendations.recommendations.length > 0) {
          // מציאת המלצה שלא שובצה עדיין עם ציון גבוה
          const availableRecommendation = shiftRecommendations.recommendations.find(r => 
            r.matchScore >= 60 && !assignedEmployees.has(r.employeeId)
          );
          
          if (availableRecommendation) {
            try {
              await onShiftUpdate(shift.id, { employee_id: availableRecommendation.employeeId });
              
              // סימון שהעובד שובץ
              assignedEmployees.add(availableRecommendation.employeeId);
              
              assignmentResults.push({
                shiftId: shift.id,
                shiftTime: `${shift.start_time}-${shift.end_time}`,
                employeeId: availableRecommendation.employeeId,
                employeeName: availableRecommendation.employeeName,
                matchScore: availableRecommendation.matchScore,
                success: true
              });
              
              console.log(`✅ שובץ בהצלחה: ${availableRecommendation.employeeName} למשמרת ${shift.start_time}-${shift.end_time} (${availableRecommendation.matchScore}%)`);
            } catch (error) {
              assignmentResults.push({
                shiftId: shift.id,
                shiftTime: `${shift.start_time}-${shift.end_time}`,
                employeeId: '',
                employeeName: '',
                matchScore: 0,
                success: false,
                reason: 'שגיאה בשיבוץ'
              });
            }
          } else {
            // בדיקה מדוע לא נמצא עובד מתאים
            const allRecommendations = shiftRecommendations.recommendations;
            const lowScoreCount = allRecommendations.filter(r => r.matchScore < 60).length;
            const alreadyAssignedCount = allRecommendations.filter(r => assignedEmployees.has(r.employeeId)).length;
            
            let reason = 'אין עובד מתאים';
            if (alreadyAssignedCount > 0 && lowScoreCount > 0) {
              reason = `${alreadyAssignedCount} עובדים כבר שובצו, ${lowScoreCount} עם ציון נמוך מ-60%`;
            } else if (alreadyAssignedCount > 0) {
              reason = `${alreadyAssignedCount} העובדים המתאימים כבר שובצו למשמרות אחרות`;
            } else if (lowScoreCount > 0) {
              reason = `${lowScoreCount} עובדים זמינים אבל עם ציון נמוך מ-60%`;
            }
            
            console.log(`❌ לא שובץ: משמרת ${shift.start_time}-${shift.end_time} - ${reason}`);
            
            assignmentResults.push({
              shiftId: shift.id,
              shiftTime: `${shift.start_time}-${shift.end_time}`,
              employeeId: '',
              employeeName: '',
              matchScore: 0,
              success: false,
              reason: reason
            });
          }
        } else {
          assignmentResults.push({
            shiftId: shift.id,
            shiftTime: `${shift.start_time}-${shift.end_time}`,
            employeeId: '',
            employeeName: '',
            matchScore: 0,
            success: false,
            reason: 'אין עובדים זמינים'
          });
        }
      }

      setResults(assignmentResults);
      
      const successCount = assignmentResults.filter(r => r.success).length;
      const totalCount = assignmentResults.length;
      
      toast.success(`שיבוץ אוטומטי הושלם: ${successCount}/${totalCount} משמרות שובצו בהצלחה`);
      
    } catch (error) {
      toast.error('שגיאה בשיבוץ האוטומטי');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || emptyShifts.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
          <Wand2 className="h-4 w-4" />
          שיבוץ אוטומטי חכם
          <Badge className="bg-white text-purple-700 ml-1">
            {emptyShifts.length} משמרות
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wand2 className="h-5 w-5" />
            שיבוץ אוטומטי חכם למשמרות
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {emptyShifts.length}
                  </div>
                  <div className="text-sm text-purple-700">משמרות ריקות</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    <Users className="h-6 w-6 mx-auto mb-1" />
                  </div>
                  <div className="text-sm text-blue-700">שיבוץ חכם לפי העדפות</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    <Clock className="h-6 w-6 mx-auto mb-1" />
                  </div>
                  <div className="text-sm text-green-700">חיסכון בזמן</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action */}
          {results.length === 0 ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                המערכת תשבץ אוטומטית את העובד הטוב ביותר לכל משמרת על סמך:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  העדפות סוג משמרת (בוקר/ערב)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  זמינות בימים
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  השיוך לסניף
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  מאזן שעות שבועיות
                </div>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  רענן המלצות
                </Button>
                
                <Button 
                  onClick={handleAutoAssign}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      מבצע שיבוץ...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      התחל שיבוץ אוטומטי
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Results */
            <div className="space-y-3">
              <h3 className="font-medium text-lg">תוצאות השיבוץ:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-xl font-bold text-green-600">
                    {results.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-green-700">שובצו בהצלחה</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                  <div className="text-xl font-bold text-red-600">
                    {results.filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-red-700">לא שובצו</div>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className={`p-3 rounded border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{result.shiftTime}</span>
                      </div>
                      
                      {result.success ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{result.employeeName}</span>
                          <Badge className="bg-green-100 text-green-800">
                            {result.matchScore}%
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-sm text-red-600">{result.reason}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={handleCancelAssignments}
                  disabled={isCancelling}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  {isCancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      מבטל שיבוצים...
                    </>
                  ) : (
                    <>
                      <Undo2 className="h-4 w-4 mr-2" />
                      בטל את כל השיבוצים
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};