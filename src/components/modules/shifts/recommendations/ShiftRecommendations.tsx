import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Star, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { EmployeeRecommendation } from '@/hooks/useEmployeeRecommendations';

interface ShiftRecommendationsProps {
  shiftTime: string;
  date: string;
  recommendations: EmployeeRecommendation[];
  onSelectEmployee: (employeeId: string) => void;
  isCompact?: boolean;
}

export const ShiftRecommendations: React.FC<ShiftRecommendationsProps> = ({
  shiftTime,
  date,
  recommendations,
  onSelectEmployee,
  isCompact = false
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getWeeklyHoursIcon = (status: string) => {
    switch (status) {
      case 'under': return '⬇️';
      case 'over': return '⬆️';
      default: return '✅';
    }
  };

  if (isCompact) {
    const topRecommendation = recommendations[0];
    if (!topRecommendation) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">💡 מומלץ:</span>
            <span className="font-medium">{topRecommendation.employeeName}</span>
            <Badge className={`text-xs ${getScoreColor(topRecommendation.matchScore)}`}>
              {topRecommendation.matchScore}%
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectEmployee(topRecommendation.employeeId)}
            className="h-6 px-2 text-xs"
          >
            בחר
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🎯 המלצות עובדים
          <Badge variant="outline" className="text-xs">
            {shiftTime} | {date}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            אין עובדים זמינים למשמרת זו
          </div>
        ) : (
          recommendations.map((rec, index) => (
            <Card key={rec.employeeId} className={`border ${rec.isHighPriority ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                      <div>
                        <h4 className="font-medium text-lg">{rec.employeeName}</h4>
                        {rec.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            {rec.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {rec.isHighPriority && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <Star className="h-3 w-3 mr-1" />
                        מומלץ מאוד
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={`text-sm font-bold ${getScoreColor(rec.matchScore)}`}>
                      {rec.matchScore}% התאמה
                    </Badge>
                    <Button
                      onClick={() => onSelectEmployee(rec.employeeId)}
                      size="sm"
                      variant={rec.isHighPriority ? "default" : "outline"}
                    >
                      בחר עובד
                    </Button>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className={`flex items-center gap-1 ${rec.shiftTypeMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {rec.shiftTypeMatch ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    סוג משמרת
                  </div>
                  <div className={`flex items-center gap-1 ${rec.availabilityMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {rec.availabilityMatch ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    זמינות
                  </div>
                  <div className={`flex items-center gap-1 ${rec.branchMatch ? 'text-green-600' : 'text-orange-600'}`}>
                    {rec.branchMatch ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    סניף
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="h-4 w-4" />
                    {getWeeklyHoursIcon(rec.weeklyHoursStatus)} שעות
                  </div>
                </div>

                {/* Reasons */}
                {rec.reasons.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-green-700 mb-1">יתרונות:</p>
                    <ul className="text-xs space-y-1">
                      {rec.reasons.map((reason, idx) => (
                        <li key={idx} className="text-green-600">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {rec.warnings.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-orange-700 mb-1">שים לב:</p>
                    <ul className="text-xs space-y-1">
                      {rec.warnings.map((warning, idx) => (
                        <li key={idx} className="text-orange-600">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};