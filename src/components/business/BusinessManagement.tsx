import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building, Users, Settings, Eye, Plus, Search } from 'lucide-react';

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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      
      // Fetch businesses
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (businessError) {
        console.error('Error fetching businesses:', businessError);
        throw businessError;
      }

      // Enrich with employee count
      const enrichedBusinesses = await Promise.all(
        (businessData || []).map(async (business) => {
          const { count } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', business.id)
            .eq('is_active', true);

          return {
            ...business,
            employee_count: count || 0,
          };
        })
      );

      setBusinesses(enrichedBusinesses);
    } catch (error) {
      console.error('Error in fetchBusinesses:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את רשימת העסקים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.admin_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewBusiness = (businessId: string) => {
    // Navigate to business dashboard
    navigate(`/business/${businessId}/dashboard`);
  };

  const handleManageBusiness = (businessId: string) => {
    // Navigate to business settings
    navigate(`/business/${businessId}/modules/settings`);
  };

  const handleCreateBusiness = () => {
    navigate('/admin/businesses/create');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                <p className="text-2xl font-bold text-gray-900">{businesses.length}</p>
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
                  {businesses.filter(b => b.is_active).length}
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
                  {businesses.reduce((sum, b) => sum + (b.employee_count || 0), 0)}
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
