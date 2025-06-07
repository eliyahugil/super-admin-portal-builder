
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building, Users, Settings, Eye, Plus, Search } from 'lucide-react';
import { useBusinessesData } from '@/hooks/useRealData';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthContext';

interface Business {
  id: string;
  name: string;
  contact_email: string;
  admin_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
  employee_count?: number;
}

export const BusinessManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();

  console.log('BusinessManagement - User profile:', {
    profile,
    role: profile?.role,
    isSuperAdmin: profile?.role === 'super_admin'
  });

  // Use the secure hook that automatically filters by business permissions
  const { data: businesses = [], isLoading: loading, error } = useBusinessesData();

  console.log('BusinessManagement - Businesses data:', {
    businessesCount: businesses.length,
    businesses: businesses.map(b => ({ id: b.id, name: b.name })),
    loading,
    error
  });

  // Enrich businesses with employee count
  const { data: enrichedBusinesses = [] } = useQuery({
    queryKey: ['enriched-businesses', businesses],
    queryFn: async () => {
      if (!businesses.length) {
        console.log('No businesses to enrich');
        return [];
      }

      console.log('Enriching businesses with employee count:', businesses.length);

      const enriched = await Promise.all(
        businesses.map(async (business) => {
          try {
            const { count, error } = await supabase
              .from('employees')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', business.id)
              .eq('is_active', true);

            if (error) {
              console.error(`Error counting employees for business ${business.id}:`, error);
              return {
                ...business,
                employee_count: 0,
              };
            }

            console.log(`Business ${business.name} has ${count} employees`);
            return {
              ...business,
              employee_count: count || 0,
            };
          } catch (err) {
            console.error(`Failed to fetch employee count for business ${business.id}:`, err);
            return {
              ...business,
              employee_count: 0,
            };
          }
        })
      );

      console.log('Enriched businesses:', enriched);
      return enriched;
    },
    enabled: !!businesses.length,
  });

  const filteredBusinesses = enrichedBusinesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.admin_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('BusinessManagement - Filtered businesses:', {
    searchTerm,
    totalBusinesses: enrichedBusinesses.length,
    filteredCount: filteredBusinesses.length
  });

  const handleViewBusiness = (businessId: string) => {
    console.log('Navigating to business dashboard:', businessId);
    navigate(`/business/${businessId}/dashboard`);
  };

  const handleManageBusiness = (businessId: string) => {
    console.log('Navigating to business settings:', businessId);
    navigate(`/business/${businessId}/modules/settings`);
  };

  const handleCreateBusiness = () => {
    console.log('Navigating to create business');
    navigate('/admin/businesses/create');
  };

  if (loading) {
    console.log('BusinessManagement - Still loading...');
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('BusinessManagement - Error loading businesses:', error);
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
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
    console.log('BusinessManagement - User is not super admin');
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין הרשאה</h3>
          <p className="text-gray-600">אין לך הרשאות מנהל ראשי</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="h-8 w-8" />
            ניהול עסקים
          </h1>
          <p className="text-gray-600 mt-2">נהל את כל העסקים במערכת</p>
          <p className="text-sm text-blue-600 mt-1">
            נמצאו {businesses.length} עסקים במערכת
          </p>
        </div>
        
        <Button onClick={handleCreateBusiness} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          צור עסק חדש
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">{enrichedBusinesses.length}</p>
                <p className="text-gray-600">סך הכל עסקים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-green-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">
                  {enrichedBusinesses.filter(b => b.is_active).length}
                </p>
                <p className="text-gray-600">עסקים פעילים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-gray-900">
                  {enrichedBusinesses.reduce((sum, b) => sum + (b.employee_count || 0), 0)}
                </p>
                <p className="text-gray-600">סך הכל עובדים</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש עסקים..."
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Businesses List */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת עסקים ({filteredBusinesses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'לא נמצאו עסקים' : 'אין עסקים במערכת'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'נסה לשנות את החיפוש' : 'צור עסק ראשון כדי להתחיל'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateBusiness} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  צור עסק חדש
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <Card key={business.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {business.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>📧 {business.contact_email || business.admin_email}</p>
                          {business.contact_phone && (
                            <p>📞 {business.contact_phone}</p>
                          )}
                          <p>👥 {business.employee_count || 0} עובדים</p>
                          <p className="text-xs text-gray-400">ID: {business.id}</p>
                        </div>
                      </div>
                      <Badge variant={business.is_active ? 'default' : 'secondary'}>
                        {business.is_active ? 'פעיל' : 'לא פעיל'}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewBusiness(business.id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        צפה
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleManageBusiness(business.id)}
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        נהל
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
