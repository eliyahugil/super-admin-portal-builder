
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Building, Users, Settings, Activity, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboard: React.FC = () => {
  const { profile, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  console.log('SuperAdminDashboard - Profile state:', {
    profile,
    isSuperAdmin
  });

  // Fetch businesses
  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['businesses-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }
      return data || [];
    },
    enabled: isSuperAdmin
  });

  // Fetch modules configuration
  const { data: moduleConfigs = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['modules-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules_config')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching modules config:', error);
        throw error;
      }
      return data || [];
    },
    enabled: isSuperAdmin
  });

  // Fetch business module configurations
  const { data: businessModules = [] } = useQuery({
    queryKey: ['business-modules-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_module_config')
        .select('*');
      
      if (error) {
        console.error('Error fetching business modules:', error);
        return [];
      }
      return data || [];
    },
    enabled: isSuperAdmin
  });

  // Toggle module for business mutation
  const toggleModuleMutation = useMutation({
    mutationFn: async ({ businessId, moduleKey, isEnabled }: {
      businessId: string;
      moduleKey: string;
      isEnabled: boolean;
    }) => {
      console.log('Toggling module:', { businessId, moduleKey, isEnabled });

      // First, validate that the module exists in modules_config
      const { data: moduleExists, error: checkError } = await supabase
        .from('modules_config')
        .select('module_key')
        .eq('module_key', moduleKey)
        .single();

      if (checkError || !moduleExists) {
        console.error('Module does not exist in modules_config:', moduleKey);
        throw new Error(`המודול ${moduleKey} לא קיים במערכת`);
      }

      if (isEnabled) {
        // Enable module
        const { error } = await supabase
          .from('business_module_config')
          .upsert({
            business_id: businessId,
            module_key: moduleKey,
            is_enabled: true,
            enabled_by: profile?.id,
            enabled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'business_id,module_key'
          });

        if (error) throw error;
      } else {
        // Disable module
        const { error } = await supabase
          .from('business_module_config')
          .update({
            is_enabled: false,
            disabled_by: profile?.id,
            disabled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('business_id', businessId)
          .eq('module_key', moduleKey);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-modules-all'] });
      toast({
        title: 'הצלחה',
        description: 'הגדרות המודול עודכנו בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error toggling module:', error);
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה בעדכון המודול',
        variant: 'destructive',
      });
    },
  });

  const isModuleEnabled = (businessId: string, moduleKey: string) => {
    return businessModules.some(
      bm => bm.business_id === businessId && 
           bm.module_key === moduleKey && 
           bm.is_enabled
    );
  };

  const handleToggleModule = (businessId: string, moduleKey: string) => {
    const isCurrentlyEnabled = isModuleEnabled(businessId, moduleKey);
    toggleModuleMutation.mutate({
      businessId,
      moduleKey,
      isEnabled: !isCurrentlyEnabled
    });
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">אין הרשאה</h2>
          <p className="text-gray-600">אין לך הרשאות מנהל ראשי</p>
        </div>
      </div>
    );
  }

  if (businessesLoading || modulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">לוח בקרה - מנהל ראשי</h1>
          <p className="text-gray-600">ברוך הבא, {profile?.full_name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">{businesses.length}</p>
                  <p className="text-gray-600">עסקים במערכת</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
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
                <Settings className="h-8 w-8 text-purple-600" />
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">{moduleConfigs.length}</p>
                  <p className="text-gray-600">מודולים זמינים</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">{businessModules.length}</p>
                  <p className="text-gray-600">הגדרות מודולים</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button 
            onClick={() => navigate('/admin/businesses')}
            className="h-16 text-lg"
          >
            <Building className="h-6 w-6 ml-2" />
            ניהול עסקים
          </Button>
          
          <Button 
            onClick={() => navigate('/admin/integrations')}
            variant="outline"
            className="h-16 text-lg"
          >
            <Settings className="h-6 w-6 ml-2" />
            אינטגרציות גלובליות
          </Button>
          
          <Button 
            onClick={() => navigate('/admin/access-requests')}
            variant="outline"
            className="h-16 text-lg"
          >
            <Users className="h-6 w-6 ml-2" />
            בקשות גישה
          </Button>
        </div>

        {/* Businesses and Modules Management */}
        <Card>
          <CardHeader>
            <CardTitle>ניהול מודולים לעסקים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {businesses.map((business) => (
                <div key={business.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{business.name}</h3>
                      <p className="text-sm text-gray-600">{business.contact_email}</p>
                    </div>
                    <Badge variant={business.is_active ? 'default' : 'secondary'}>
                      {business.is_active ? 'פעיל' : 'לא פעיל'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {moduleConfigs.map((module) => (
                      <div key={module.module_key} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{module.display_name}</p>
                          <p className="text-xs text-gray-500">{module.module_key}</p>
                        </div>
                        <Switch
                          checked={isModuleEnabled(business.id, module.module_key)}
                          onCheckedChange={() => handleToggleModule(business.id, module.module_key)}
                          disabled={toggleModuleMutation.isPending}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
