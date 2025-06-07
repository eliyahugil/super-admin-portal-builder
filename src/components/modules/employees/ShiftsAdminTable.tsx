
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Calendar, Clock, User } from 'lucide-react';

interface ShiftData {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_at: string;
  employee: {
    first_name: string;
    last_name: string;
    email?: string;
  };
}

interface ShiftsAdminTableProps {
  businessId?: string;
}

export const ShiftsAdminTable: React.FC<ShiftsAdminTableProps> = ({ businessId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: shifts = [], isLoading, error } = useQuery({
    queryKey: ['shifts-admin', businessId],
    queryFn: async (): Promise<ShiftData[]> => {
      let query = supabase
        .from('employee_shift_requests')
        .select(`
          *,
          employee:employees(first_name, last_name, email, business_id)
        `)
        .order('shift_date', { ascending: false });

      if (businessId) {
        query = query.eq('employee.business_id', businessId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });

  const filteredShifts = shifts.filter(shift =>
    shift.employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">ממתין</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">אושר</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">נדחה</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת המשמרות</h3>
          <p className="text-gray-600">אנא נסה לרענן את הדף</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          ניהול משמרות - תצוגת מנהל
        </h1>
        <p className="text-gray-600 mt-2">צפה ונהל את כל בקשות המשמרות</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש עובדים..."
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredShifts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'לא נמצאו תוצאות' : 'אין בקשות משמרות'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'נסה לשנות את החיפוש' : 'עדיין לא נשלחו בקשות משמרות'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShifts.map((shift) => (
            <Card key={shift.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {shift.employee.first_name} {shift.employee.last_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{shift.employee.email}</p>
                  </div>
                  {getStatusBadge(shift.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {new Date(shift.shift_date).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {shift.start_time} - {shift.end_time}
                    </span>
                  </div>
                  
                  {shift.notes && (
                    <div>
                      <h4 className="font-medium mb-1 text-sm">הערות:</h4>
                      <p className="text-sm text-gray-700">{shift.notes}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    נשלח ב: {new Date(shift.created_at).toLocaleDateString('he-IL')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
