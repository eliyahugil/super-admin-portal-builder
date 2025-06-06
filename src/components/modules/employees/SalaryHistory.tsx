
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar, Plus, Edit } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface SalaryRecord {
  id: string;
  employee_id: string;
  amount: number;
  currency: string;
  type: 'hourly' | 'monthly' | 'fixed';
  effective_date: string;
  reason?: string;
  approved_by?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
  approver?: {
    full_name: string;
  };
  creator?: {
    full_name: string;
  };
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: salaryRecords, isLoading } = useQuery({
    queryKey: ['salary-history', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_salary_history')
        .select(`
          *,
          approver:profiles!employee_salary_history_approved_by_fkey(full_name),
          creator:profiles!employee_salary_history_created_by_fkey(full_name)
        `)
        .eq('employee_id', employeeId)
        .order('effective_date', { ascending: false });

      if (error) {
        console.error('Error fetching salary history:', error);
        throw error;
      }

      return data as SalaryRecord[];
    },
    enabled: !!employeeId,
  });

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
      currency: currency || 'ILS',
    }).format(amount);
  };

  const calculateIncrease = (current: number, previous: number) => {
    const increase = ((current - previous) / previous) * 100;
    return increase.toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

      {salaryRecords && salaryRecords.length > 0 ? (
        <div className="space-y-4">
          {/* Current Salary Summary */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">שכר נוכחי</h4>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(salaryRecords[0].amount, salaryRecords[0].currency)}
                    <span className="text-sm font-normal mr-2">
                      / {salaryRecords[0].type === 'hourly' ? 'שעה' : 'חודש'}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <Badge className={getSalaryTypeColor(salaryRecords[0].type)}>
                    {getSalaryTypeLabel(salaryRecords[0].type)}
                  </Badge>
                  {salaryRecords.length > 1 && (
                    <div className="flex items-center gap-1 mt-2 text-green-700">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">
                        +{calculateIncrease(
                          salaryRecords[0].amount,
                          salaryRecords[1].amount
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
                            record.amount,
                            salaryRecords[index + 1].amount
                          )}%
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(record.effective_date), 'dd/MM/yyyy', { locale: he })}
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
                  
                  {record.approver?.full_name && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">אושר על ידי: </span>
                      <span className="text-sm text-gray-600">{record.approver.full_name}</span>
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
