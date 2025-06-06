
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar, Plus, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface SalaryRecord {
  id: string;
  amount: number;
  currency: string;
  type: 'hourly' | 'monthly' | 'fixed';
  effectiveDate: string;
  reason?: string;
  approvedBy?: string;
  notes?: string;
}

interface SalaryHistoryProps {
  employeeId: string;
  employeeName: string;
  canEdit?: boolean;
}

export const SalaryHistory: React.FC<SalaryHistoryProps> = ({ 
  employeeId, 
  employeeName,
  canEdit = true 
}) => {
  // Mock data - in real app this would come from API
  const [salaryRecords] = useState<SalaryRecord[]>([
    {
      id: '1',
      amount: 35,
      currency: 'ILS',
      type: 'hourly',
      effectiveDate: '2024-01-01',
      reason: 'שכר התחלתי',
      approvedBy: 'מנהל משאבי אנוש',
    },
    {
      id: '2',
      amount: 38,
      currency: 'ILS',
      type: 'hourly',
      effectiveDate: '2024-06-01',
      reason: 'העלאת שכר על בסיס ביצועים',
      approvedBy: 'מנהל משאבי אנוש',
      notes: 'העלאה בעקבות הערכת ביצועים מעולה',
    },
  ]);

  const getSalaryTypeLabel = (type: string) => {
    switch (type) {
      case 'hourly': return 'שכר שעתי';
      case 'monthly': return 'שכר חודשי';
      case 'fixed': return 'שכר קבוע';
      default: return type;
    }
  };

  const getSalaryTypeColor = (type: string) => {
    switch (type) {
      case 'hourly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-green-100 text-green-800';
      case 'fixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const calculateIncrease = (current: number, previous: number) => {
    const increase = ((current - previous) / previous) * 100;
    return increase.toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">היסטוריית שכר</h3>
        </div>
        
        {canEdit && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            הוסף רישום שכר
          </Button>
        )}
      </div>

      {salaryRecords.length > 0 ? (
        <div className="space-y-4">
          {/* Current Salary Summary */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">שכר נוכחי</h4>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(salaryRecords[salaryRecords.length - 1].amount, salaryRecords[salaryRecords.length - 1].currency)}
                    <span className="text-sm font-normal mr-2">
                      / {salaryRecords[salaryRecords.length - 1].type === 'hourly' ? 'שעה' : 'חודש'}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <Badge className={getSalaryTypeColor(salaryRecords[salaryRecords.length - 1].type)}>
                    {getSalaryTypeLabel(salaryRecords[salaryRecords.length - 1].type)}
                  </Badge>
                  {salaryRecords.length > 1 && (
                    <div className="flex items-center gap-1 mt-2 text-green-700">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">
                        +{calculateIncrease(
                          salaryRecords[salaryRecords.length - 1].amount,
                          salaryRecords[salaryRecords.length - 2].amount
                        )}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary History */}
          <div className="space-y-3">
            {salaryRecords.map((record, index) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold">
                        {formatCurrency(record.amount, record.currency)}
                        <span className="text-sm font-normal text-gray-500 mr-2">
                          / {record.type === 'hourly' ? 'שעה' : 'חודש'}
                        </span>
                      </div>
                      <Badge className={getSalaryTypeColor(record.type)}>
                        {getSalaryTypeLabel(record.type)}
                      </Badge>
                      {index < salaryRecords.length - 1 && (
                        <Badge variant="outline" className="text-green-600">
                          +{calculateIncrease(
                            salaryRecords[index + 1].amount,
                            record.amount
                          )}%
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(record.effectiveDate), 'dd/MM/yyyy', { locale: he })}
                      </div>
                      {canEdit && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {record.reason && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">סיבה: </span>
                      <span className="text-sm text-gray-600">{record.reason}</span>
                    </div>
                  )}
                  
                  {record.approvedBy && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">אושר על ידי: </span>
                      <span className="text-sm text-gray-600">{record.approvedBy}</span>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                      <strong>הערות:</strong> {record.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין רישומי שכר</h3>
            <p className="text-gray-500 mb-4">לא הוגדרו עדיין רישומי שכר עבור {employeeName}</p>
            {canEdit && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                הוסף רישום שכר ראשון
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
