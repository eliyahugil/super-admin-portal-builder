import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { ShiftTokenService } from '@/services/ShiftTokenService';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Link as LinkIcon, Clock, User, Search } from 'lucide-react';

export const ShiftTokenManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const { toast } = useToast();
  const { businessId, isLoading, isSuperAdmin } = useBusiness();
  const queryClient = useQueryClient();

  // Get employees for the business
  const { data: employees } = useQuery({
    queryKey: ['employees', businessId, isSuperAdmin],
    queryFn: async () => {
      // אם זה super admin ואין businessId, נביא את כל העובדים
      if (isSuperAdmin && !businessId) {
        const { data, error } = await supabase
          .from('employees')
          .select('id, first_name, last_name, employee_id, business_id')
          .eq('is_active', true)
          .order('first_name');
        
        if (error) throw error;
        return data || [];
      }

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
    enabled: (!!businessId || isSuperAdmin) && !isLoading,
  });

  // Get shift tokens
  const { data: tokens } = useQuery({
    queryKey: ['shift-tokens', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      return await ShiftTokenService.getTokensForBusiness(businessId);
    },
    enabled: !!businessId && !isLoading,
  });

  // Generate token mutation
  const generateTokenMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      return await ShiftTokenService.generateToken(employeeId, 168); // 7 days
    },
    onSuccess: (token) => {
      toast({
        title: 'הצלחה',
        description: 'טוקן נוצר בהצלחה',
      });
      queryClient.invalidateQueries({ queryKey: ['shift-tokens'] });
      
      // Copy token to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/shift-submission/${token}`);
      toast({
        title: 'הקישור הועתק',
        description: 'קישור הגשת המשמרת הועתק ללוח',
      });
    },
    onError: (error) => {
      console.error('Token generation error:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה ביצירת הטוקן',
        variant: 'destructive',
      });
    },
  });

  const handleGenerateToken = () => {
    if (!selectedEmployee) {
      toast({
        title: 'שגיאה',
        description: 'יש לבחור עובד',
        variant: 'destructive',
      });
      return;
    }
    generateTokenMutation.mutate(selectedEmployee);
  };

  const copyTokenLink = (token: string) => {
    const link = `${window.location.origin}/shift-submission/${token}`;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול טוקני משמרות</h1>
        <p className="text-gray-600">יצירה וניהול טוקנים להגשת בקשות משמרות</p>
      </div>

      {/* Generate Token Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            יצירת טוקן חדש
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
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
            <Button
              onClick={handleGenerateToken}
              disabled={!selectedEmployee || generateTokenMutation.isPending}
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
                <Badge variant={token.is_used ? "secondary" : new Date(token.expires_at) < new Date() ? "destructive" : "default"}>
                  {token.is_used ? 'נוצל' : new Date(token.expires_at) < new Date() ? 'פג תוקף' : 'פעיל'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
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
              
              {!token.is_used && new Date(token.expires_at) > new Date() && (
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין טוקנים</h3>
          <p className="text-gray-600">לא נמצאו טוקנים במערכת</p>
        </div>
      )}
    </div>
  );
};
