
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useBusinessesData } from '@/hooks/useRealData';
import { useAuth } from '@/components/auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EnrichedBusiness {
  id: string;
  name: string;
  contact_email: string;
  admin_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
  employee_count?: number;
  branches_count?: number;
  last_activity?: string;
}

export const BusinessManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const navigate = useNavigate();
  const { profile } = useAuth();

  console.log('BusinessManagement - User profile:', {
    profile,
    role: profile?.role,
    isSuperAdmin: profile?.role === 'super_admin'
  });

  // Use the secure hook that automatically filters by business permissions
  const { data: businesses = [], isLoading: loading, error } = useBusinessesData();

  // Enrich businesses with employee and branch counts
  const { data: enrichedBusinesses = [] } = useQuery({
    queryKey: ['enriched-businesses', businesses],
    queryFn: async () => {
      if (!businesses.length) {
        console.log('No businesses to enrich');
        return [];
      }

      console.log('Enriching businesses with counts:', businesses.length);

      const enriched = await Promise.all(
        businesses.map(async (business): Promise<EnrichedBusiness> => {
          try {
            // Get employee count
            const { count: employeeCount } = await supabase
              .from('employees')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', business.id)
              .eq('is_active', true);

            // Get branches count
            const { count: branchesCount } = await supabase
              .from('branches')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', business.id)
              .eq('is_active', true);

            // Get last activity from recent employee or branch updates
            const { data: lastActivity } = await supabase
              .from('employees')
              .select('updated_at')
              .eq('business_id', business.id)
              .order('updated_at', { ascending: false })
              .limit(1);

            return {
              ...business,
              employee_count: employeeCount || 0,
              branches_count: branchesCount || 0,
              last_activity: lastActivity?.[0]?.updated_at || business.created_at,
            };
          } catch (err) {
            console.error(`Failed to fetch counts for business ${business.id}:`, err);
            return {
              ...business,
              employee_count: 0,
              branches_count: 0,
              last_activity: business.created_at,
            };
          }
        })
      );

      console.log('Enriched businesses:', enriched);
      return enriched;
    },
    enabled: !!businesses.length,
  });

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">פעיל</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">לא פעיל</Badge>
    );
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const filteredBusinesses = enrichedBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.admin_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && business.is_active) ||
                         (selectedStatus === 'inactive' && !business.is_active);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת העסקים</h3>
          <p className="text-gray-600 mb-4">אנא נסה לרענן את הדף</p>
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  // Check if user is super admin
  if (profile?.role !== 'super_admin') {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין הרשאה</h3>
          <p className="text-gray-600">אין לך הרשאות מנהל ראשי</p>
        </div>
      </div>
    );
  }

  const totalEmployees = enrichedBusinesses.reduce((sum, b) => sum + (b.employee_count || 0), 0);
  const activeBusinesses = enrichedBusinesses.filter(b => b.is_active).length;

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ניהול עסקים</h1>
            <p className="text-gray-600 mt-2">נהל עסקים רשומים במערכת</p>
          </div>
          <Button onClick={() => navigate('/admin/businesses/create')}>
            <Plus className="h-4 w-4 mr-2" />
            הוסף עסק חדש
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div className="mr-4">
                <p className="text-2xl font-bold">{enrichedBusinesses.length}</p>
                <p className="text-sm text-gray-600">סה"כ עסקים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="mr-4">
                <p className="text-2xl font-bold">{activeBusinesses}</p>
                <p className="text-sm text-gray-600">עסקים פעילים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="mr-4">
                <p className="text-2xl font-bold">{enrichedBusinesses.length - activeBusinesses}</p>
                <p className="text-sm text-gray-600">עסקים לא פעילים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="mr-4">
                <p className="text-2xl font-bold">{totalEmployees}</p>
                <p className="text-sm text-gray-600">סה"כ עובדים</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="חפש עסק או בעל עסק..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">הכל</TabsTrigger>
                <TabsTrigger value="active">פעילים</TabsTrigger>
                <TabsTrigger value="inactive">לא פעילים</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Businesses Table */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת עסקים</CardTitle>
          <CardDescription>
            {filteredBusinesses.length} עסקים מתוך {enrichedBusinesses.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'לא נמצאו עסקים' : 'אין עסקים במערכת'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'נסה לשנות את החיפוש' : 'צור עסק ראשון כדי להתחיל'}
                </p>
              </div>
            ) : (
              filteredBusinesses.map((business) => (
                <div key={business.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 space-x-reverse">
                      <div className="flex-shrink-0">
                        {getStatusIcon(business.is_active)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {business.name}
                          </h3>
                          {getStatusBadge(business.is_active)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>אימייל יצירת קשר:</strong> {business.contact_email || business.admin_email}</p>
                            <p><strong>טלפון:</strong> {business.contact_phone || 'לא צוין'}</p>
                          </div>
                          <div>
                            <p><strong>עובדים:</strong> {business.employee_count || 0}</p>
                            <p><strong>סניפים:</strong> {business.branches_count || 0}</p>
                          </div>
                          <div>
                            <p><strong>נרשם:</strong> {new Date(business.created_at).toLocaleDateString('he-IL')}</p>
                            <p><strong>פעיל לאחרונה:</strong> {new Date(business.last_activity || business.created_at).toLocaleDateString('he-IL')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/business/${business.id}/dashboard`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        צפייה
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/business/${business.id}/modules/settings`)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        הגדרות
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/modules/employees?business=${business.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        עריכה
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
