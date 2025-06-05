
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Search, Download, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

export const EmployeeDocs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: signedDocuments } = useQuery({
    queryKey: ['employee-docs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          *,
          employee:employees(first_name, last_name, employee_id)
        `)
        .not('digital_signature_data', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const filteredDocs = signedDocuments?.filter(doc =>
    doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.employee && 
     `${doc.employee.first_name} ${doc.employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">מסמכים חתומים</h1>
        <p className="text-gray-600">מסמכים וטפסים שנחתמו דיגיטלית על ידי העובדים</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="חפש מסמכים חתומים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs?.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-6 w-6 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">חתום</Badge>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString('he-IL')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2 truncate">{doc.document_name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {doc.employee && `${doc.employee.first_name} ${doc.employee.last_name}`}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                סוג: {doc.document_type}
              </p>
              
              {/* Signature info */}
              {doc.digital_signature_data && (
                <div className="mb-4 p-2 bg-green-50 rounded-md">
                  <p className="text-xs text-green-800 font-medium">חתימה דיגיטלית מאומתת</p>
                  <p className="text-xs text-green-700">
                    {new Date(doc.digital_signature_data.timestamp || doc.created_at).toLocaleString('he-IL')}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 ml-1" />
                  צפה
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 ml-1" />
                  הורד
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocs?.length === 0 && (
        <div className="text-center py-12">
          <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין מסמכים חתומים</h3>
          <p className="text-gray-600">לא נמצאו מסמכים חתומים במערכת</p>
        </div>
      )}
    </div>
  );
};
