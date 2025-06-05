
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useBusiness } from '@/hooks/useBusiness';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  Users, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Globe, 
  Building, 
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface BusinessIntegrationStats {
  business_name: string;
  business_id: string;
  total_integrations: number;
  active_integrations: number;
}

export const SuperAdminIntegrationsDashboard: React.FC = () => {
  const { integrations, loading: integrationsLoading } = useIntegrations();

  // Get all business integration statistics with proper joins
  const { data: businessStats, isLoading: businessStatsLoading } = useQuery({
    queryKey: ['business-integration-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_integrations')
        .select(`
          business_id,
          is_active,
          businesses!inner(name)
        `);

      if (error) throw error;

      // Group by business and calculate stats
      const businessMap = new Map<string, BusinessIntegrationStats>();
      
      data?.forEach(integration => {
        const businessId = integration.business_id;
        const businessName = integration.businesses?.name || 'Unknown Business';
        
        if (!businessMap.has(businessId)) {
          businessMap.set(businessId, {
            business_id: businessId,
            business_name: businessName,
            total_integrations: 0,
            active_integrations: 0,
          });
        }
        
        const stats = businessMap.get(businessId)!;
        stats.total_integrations++;
        if (integration.is_active) {
          stats.active_integrations++;
        }
      });

      return Array.from(businessMap.values());
    },
  });

  // Get global integration statistics
  const { data: globalStats } = useQuery({
    queryKey: ['global-integration-stats'],
    queryFn: async () => {
      const { count: totalSupported } = await supabase
        .from('supported_integrations')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: totalBusinessIntegrations } = await supabase
        .from('business_integrations')
        .select('*', { count: 'exact', head: true });

      const { count: activeBusinessIntegrations } = await supabase
        .from('business_integrations')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: totalBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      return {
        totalSupported: totalSupported || 0,
        totalBusinessIntegrations: totalBusinessIntegrations || 0,
        activeBusinessIntegrations: activeBusinessIntegrations || 0,
        totalBusinesses: totalBusinesses || 0,
      };
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'maps': 'bg-blue-100 text-blue-800',
      'crm': 'bg-purple-100 text-purple-800',
      'invoicing': 'bg-green-100 text-green-800',
      'communication': 'bg-yellow-100 text-yellow-800',
      'automation': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryDisplayName = (category: string) => {
    const displayNames: Record<string, string> = {
      'maps': 'מפות וניווט',
      'crm': 'ניהול לקוחות',
      'invoicing': 'חשבוניות',
      'communication': 'תקשורת',
      'automation': 'אוטומציה',
    };
    return displayNames[category] || category;
  };

  if (integrationsLoading || businessStatsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">דשבורד אינטגרציות - מנהל מערכת</h1>
        <p className="text-gray-600 mt-2">
          מרכז שליטה לניהול כל האינטגרציות במערכת
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">אינטגרציות נתמכות</p>
                <p className="text-3xl font-bold text-blue-600">
                  {globalStats?.totalSupported || 0}
                </p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">עסקים פעילים</p>
                <p className="text-3xl font-bold text-green-600">
                  {globalStats?.totalBusinesses || 0}
                </p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">חיבורים פעילים</p>
                <p className="text-3xl font-bold text-purple-600">
                  {globalStats?.activeBusinessIntegrations || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">סה״כ חיבורים</p>
                <p className="text-3xl font-bold text-orange-600">
                  {globalStats?.totalBusinessIntegrations || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="integrations">אינטגרציות נתמכות</TabsTrigger>
          <TabsTrigger value="businesses">סטטוס עסקים</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                אינטגרציות נתמכות
              </CardTitle>
              <CardDescription>
                רשימת כל האינטגרציות הזמינות במערכת ומצב השימוש שלהן
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => {
                  const businessUsageCount = businessStats?.reduce((count, business) => {
                    return count + business.active_integrations;
                  }, 0) || 0;

                  return (
                    <div 
                      key={integration.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{integration.icon || '🔗'}</span>
                        <div>
                          <h3 className="font-semibold">{integration.display_name}</h3>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className={getCategoryColor(integration.category)}>
                              {getCategoryDisplayName(integration.category)}
                            </Badge>
                            {integration.requires_global_key && (
                              <Badge variant="secondary" className="text-xs">
                                מפתח גלובלי
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">עסקים משתמשים</p>
                          <p className="text-lg font-semibold">{businessUsageCount}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Activity className="h-4 w-4 mr-1" />
                            בדוק סטטוס
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            הגדרות
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                סטטוס אינטגרציות עסקים
              </CardTitle>
              <CardDescription>
                מצב האינטגרציות לכל עסק במערכת
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessStats?.map((business) => (
                  <div 
                    key={business.business_id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <Building className="h-8 w-8 text-gray-400" />
                      <div>
                        <h3 className="font-semibold">{business.business_name}</h3>
                        <p className="text-sm text-gray-600">
                          {business.active_integrations} מתוך {business.total_integrations} אינטגרציות פעילות
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {business.active_integrations > 0 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : business.total_integrations > 0 ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Badge 
                          variant={business.active_integrations > 0 ? 'default' : 'secondary'}
                        >
                          {business.active_integrations > 0 ? 'פעיל' : 'לא פעיל'}
                        </Badge>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/${business.business_id}/integrations`, '_blank')}
                      >
                        נהל אינטגרציות
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!businessStats || businessStats.length === 0) && (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">אין עסקים רשומים במערכת</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
