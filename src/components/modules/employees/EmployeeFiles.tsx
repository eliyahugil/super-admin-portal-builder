import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';

export const EmployeeFiles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const { toast } = useToast();
  const { businessId, isLoading } = useBusiness();

  const { data: employees } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id, business_id')
        .order('first_name');

      // Filter by business_id if not super admin
      if (businessId !== 'super_admin') {
        query = query.eq('business_id', businessId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !isLoading,
  });

  const { data: employeeFiles } = useQuery({
    queryKey: ['employee-files', selectedEmployee, businessId],
    queryFn: async () => {
      if (!businessId) return [];

      let query = supabase
        .from('employee_documents')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id, business_id)
        `)
        .order('created_at', { ascending: false });

      // Filter by business_id if not super admin
      if (businessId !== 'super_admin') {
        query = query.eq('employee.business_id', businessId);
      }

      if (selectedEmployee) {
        query = query.eq('employee_id', selectedEmployee);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId && !isLoading,
  });

  const filteredFiles = employeeFiles?.filter(file =>
    file.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.employee && 
     `${file.employee.first_name} ${file.employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">קבצי עובדים</h1>
        <p className="text-gray-600">ניהול מסמכים וקבצים אישיים של העובדים</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="חפש קבצים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">כל העובדים</option>
          {employees?.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name} ({employee.employee_id})
            </option>
          ))}
        </select>

        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          העלה קובץ
        </Button>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles?.map((file) => (
          <Card key={file.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-blue-600" />
                <Badge variant="secondary">
                  {file.document_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2 truncate">{file.document_name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {file.employee && `${file.employee.first_name} ${file.employee.last_name}`}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                הועלה: {new Date(file.created_at).toLocaleDateString('he-IL')}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-4 w-4 ml-1" />
                  הורד
                </Button>
                <Button size="sm" variant="outline">
                  צפה
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles?.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין קבצים</h3>
          <p className="text-gray-600">לא נמצאו קבצים במערכת</p>
        </div>
      )}
    </div>
  );
};
