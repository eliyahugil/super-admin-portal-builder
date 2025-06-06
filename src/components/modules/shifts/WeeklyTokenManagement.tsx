
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { WeeklyShiftService } from '@/services/WeeklyShiftService';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Link as LinkIcon, Clock, User, Search, Calendar } from 'lucide-react';

export const WeeklyTokenManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const { toast } = useToast();
  const { businessId, isLoading } = useBusiness();
  const queryClient = useQueryClient();

  // Get employees for the business
  const { data: employees } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id')
        .eq('is_active', true)
        .order('first_name');

      if (businessId !== 'super_admin') {
        query = query.eq('business_id', businessId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !isLoading,
  });

  // Get weekly tokens
  const { data: tokens } = useQuery({
    queryKey: ['weekly-tokens', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      return await WeeklyShiftService.getWeeklyTokensForBusiness(businessId);
    },
    enabled: !!businessId && !isLoading,
  });

  // Generate weekly token mutation
  const generateTokenMutation = useMutation({
    mutationFn: async ({ employeeId, weekStart, weekEnd }: { employeeId: string; weekStart: string; weekEnd: string }) => {
      return await WeeklyShiftService.generateWeeklyToken(employeeId, weekStart, weekEnd);
    },
    onSuccess: (token) => {
      toast({
        title: 'הצלחה',
        description: 'טוקן שבועי נוצר בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['weekly-tokens'] });
      
      // Copy token to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/weekly-shift-submission/${token}`);
      toast({
        title: 'הקישור הועתק',
        description: 'קישור הגשת המשמרות השבועיות הועתק ללוח',
      });
      
      // Reset form
      setSelectedEmployee('');
      setWeekStartDate('');
      setWeekEndDate('');
    },
    onError: (error: any) => {
      console.error('Weekly token generation error:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה ביצירת הטוקן השבועי',
        variant: 'destructive',
      });
    },
  });

  const handleGenerateToken = () => {
    if (!selectedEmployee || !weekStartDate || !weekEndDate) {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את כל השדות הנדרשים',
        variant: 'destructive',
      });
      return;
    }

    const startDate = new Date(weekStartDate);
    const endDate = new Date(weekEndDate);
    
    if (endDate <= startDate) {
      toast({
        title: 'שגיאה',
        description: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה',
        variant: 'destructive',
      });
      return;
    }

    generateTokenMutation.mutate({
      employeeId: selectedEmployee,
      weekStart: weekStartDate,
      weekEnd: weekEndDate,
    });
  };

  const copyTokenLink = (token: string) => {
    const link = `${window.location.origin}/weekly-shift-submission/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'הועתק',
      description: 'הקישור הועתק ללוח',
    });
  };

  const filteredTokens = tokens?.filter(token =>
    token.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.employee?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול טוקני משמרות שבועיים</h1>
        <p className="text-gray-600">יצירה וניהול טוקנים להגשת בקשות משמרות שבועיות</p>
      </div>

      {/* Generate Token Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            יצירת טוקן שבועי חדש
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">בחר עובד</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">בחר עובד...</option>
                {employees?.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name} ({employee.employee_id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">תחילת השבוע</label>
              <Input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">סוף השבוע</label>
              <Input
                type="date"
                value={weekEndDate}
                onChange={(e) => setWeekEndDate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleGenerateToken}
              disabled={!selectedEmployee || !weekStartDate || !weekEndDate || generateTokenMutation.isPending}
            >
              {generateTokenMutation.isPending ? 'יוצר...' : 'צור טוקן'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="חפש לפי שם עובד..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Tokens List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTokens?.map((token) => (
          <Card key={token.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">
                    {token.employee?.first_name} {token.employee?.last_name}
                  </span>
                </div>
                <Badge variant={!token.is_active ? "secondary" : new Date(token.expires_at) < new Date() ? "destructive" : "default"}>
                  {!token.is_active ? 'נוצל' : new Date(token.expires_at) < new Date() ? 'פג תוקף' : 'פעיל'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    שבוע: {new Date(token.week_start_date).toLocaleDateString('he-IL')} - {new Date(token.week_end_date).toLocaleDateString('he-IL')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>נוצר: {new Date(token.created_at).toLocaleDateString('he-IL')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>פג תוקף: {new Date(token.expires_at).toLocaleDateString('he-IL')}</span>
                </div>
                {token.employee?.employee_id && (
                  <div className="text-gray-600">
                    מס' עובד: {token.employee.employee_id}
                  </div>
                )}
              </div>
              
              {token.is_active && new Date(token.expires_at) > new Date() && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => copyTokenLink(token.token)}
                >
                  <LinkIcon className="h-4 w-4 ml-1" />
                  העתק קישור
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTokens?.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין טוקנים שבועיים</h3>
          <p className="text-gray-600">לא נמצאו טוקנים שבועיים במערכת</p>
        </div>
      )}
    </div>
  );
};
