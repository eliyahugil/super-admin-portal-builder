
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, 
  Settings, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  Download,
  Upload,
  Building2,
  Activity
} from 'lucide-react';

export const SystemPreview: React.FC = () => {
  const { moduleId } = useParams();
  const [previewMode, setPreviewMode] = useState('desktop');

  // שליפת נתונים אמיתיים מהמערכת
  const { data: businesses } = useQuery({
    queryKey: ['system-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  const { data: profiles } = useQuery({
    queryKey: ['system-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: employees } = useQuery({
    queryKey: ['system-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  const { data: scheduledShifts } = useQuery({
    queryKey: ['system-shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_shifts')
        .select('*')
        .gte('shift_date', new Date().toISOString().split('T')[0]);
      if (error) throw error;
      return data;
    }
  });

  const { data: productionBatches } = useQuery({
    queryKey: ['system-production'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_batches')
        .select('*')
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  const { data: invoices } = useQuery({
    queryKey: ['system-invoices'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('invoices')
        .select('*')
        .limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">עבר</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">אזהרה</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">נכשל</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-8 w-8" />
              תצוגת מערכת
            </h1>
            <p className="text-gray-600 mt-2">נתונים אמיתיים מהמערכת</p>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            מערכת פעילה
          </Badge>
        </div>
      </div>

      {/* System Statistics - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              עסקים פעילים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {businesses?.length || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">עסקים רשומים במערכת</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              משתמשים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {profiles?.length || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">משתמשים רשומים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              עובדים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {employees?.length || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">עובדים פעילים במערכת</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              משמרות עתידיות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {scheduledShifts?.length || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">משמרות מתוכננות</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Data */}
        <Card>
          <CardHeader>
            <CardTitle>נתוני ייצור</CardTitle>
            <CardDescription>סטטיסטיקות יומן ייצור</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">אצוות ייצור</p>
                    <p className="text-sm text-gray-600">אצוות רשומות במערכת</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  {productionBatches?.length || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">אצוות פעילות</p>
                    <p className="text-sm text-gray-600">אצוות בתהליך ייצור</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  {productionBatches?.filter(b => b.status === 'in_progress').length || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">אצוות שהושלמו</p>
                    <p className="text-sm text-gray-600">אצוות שהושלמו בהצלחה</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  {productionBatches?.filter(b => b.status === 'completed').length || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounting Data */}
        <Card>
          <CardHeader>
            <CardTitle>נתוני חשבונות</CardTitle>
            <CardDescription>סטטיסטיקות מערכת חשבונות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">חשבוניות</p>
                    <p className="text-sm text-gray-600">חשבוניות במערכת</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  {invoices?.length || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">עסקים עם חשבוניות</p>
                    <p className="text-sm text-gray-600">עסקים שיצרו חשבוניות</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  {new Set(invoices?.map(i => i.business_id)).size || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">סכום כולל</p>
                    <p className="text-sm text-gray-600">סכום חשבוניות (30 ימים)</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  ₪{invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toLocaleString() || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>פעילות אחרונה</CardTitle>
          <CardDescription>עסקים שנוצרו לאחרונה</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {businesses?.slice(0, 5).map((business) => (
              <div key={business.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{business.name}</p>
                    <p className="text-sm text-gray-600">{business.contact_email}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {new Date(business.created_at).toLocaleDateString('he-IL')}
                </Badge>
              </div>
            ))}
            {(!businesses || businesses.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                אין עסקים רשומים במערכת
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
