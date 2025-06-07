
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  Building, 
  Users, 
  Settings, 
  Plus, 
  Search,
  Mail,
  Activity,
  Shield,
  AlertCircle,
  Menu,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Business {
  id: string;
  name: string;
  contact_email: string;
  owner_id: string;
  is_active: boolean;
  employee_count: number;
  modules: Array<{ module_key: string; is_enabled: boolean }>;
}

export const SuperAdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [moduleKeys] = useState([
    'shift_management',
    'employee_documents', 
    'employee_notes',
    'salary_management',
    'employee_contacts',
    'branch_management',
    'employee_attendance'
  ]);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isSuperAdmin } = useAuth();

  console.log('SuperAdminDashboard - Profile state:', { profile, isSuperAdmin });

  useEffect(() => {
    if (!isSuperAdmin) {
      console.log('SuperAdminDashboard - Not super admin, skipping data fetch');
      setError('אין הרשאות מנהל ראשי');
      setLoading(false);
      return;
    }
    
    fetchBusinessData();
  }, [isSuperAdmin]);

  const fetchBusinessData = async () => {
    try {
      console.log('=== FETCHING BUSINESS DATA ===');
      setLoading(true);
      setError(null);
      
      const { data: bizList, error: bizError } = await supabase
        .from('businesses')
        .select('id, name, contact_email, owner_id, is_active')
        .order('created_at', { ascending: false });

      if (bizError) {
        console.error('Error fetching businesses:', bizError);
        setError('שגיאה בטעינת העסקים');
        return;
      }

      console.log('Businesses fetched:', bizList?.length || 0);

      const enriched = await Promise.all(
        (bizList || []).map(async (biz) => {
          // Get employee count
          const { count: empCount } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', biz.id)
            .eq('is_active', true);

          // Get modules for this business
          const { data: mods } = await supabase
            .from('business_module_config')
            .select('module_key, is_enabled')
            .eq('business_id', biz.id);

          return {
            ...biz,
            employee_count: empCount || 0,
            modules: mods || [],
          };
        })
      );

      setBusinesses(enriched);
      console.log('Enriched businesses:', enriched.length);
    } catch (error) {
      console.error('Error in fetchBusinessData:', error);
      setError('שגיאה במערכת');
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את נתוני העסקים',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (bizId: string, moduleKey: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('business_module_config')
        .upsert({
          business_id: bizId,
          module_key: moduleKey,
          is_enabled: !currentValue,
          enabled_by: profile?.id,
          enabled_at: !currentValue ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'business_id,module_key',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: `המודול ${!currentValue ? 'הופעל' : 'הושבת'} בהצלחה`,
      });

      // Update local state
      setBusinesses(prev => prev.map(biz => {
        if (biz.id === bizId) {
          const updatedModules = biz.modules.some(m => m.module_key === moduleKey)
            ? biz.modules.map(m => 
                m.module_key === moduleKey 
                  ? { ...m, is_enabled: !currentValue }
                  : m
              )
            : [...biz.modules, { module_key: moduleKey, is_enabled: !currentValue }];
          
          return { ...biz, modules: updatedModules };
        }
        return biz;
      }));

    } catch (error) {
      console.error('Error toggling module:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את המודול',
        variant: 'destructive',
      });
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין הרשאה</h3>
          <p className="text-gray-600">אין לך הרשאות מנהל ראשי</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">טוען נתוני מנהל ראשי...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchBusinessData} className="mt-4">
            נסה שוב
          </Button>
        </div>
      </div>
    );
  }

  const filtered = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.contact_email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalStats = {
    totalBusinesses: businesses.length,
    activeBusinesses: businesses.filter(b => b.is_active).length,
    totalEmployees: businesses.reduce((sum, b) => sum + b.employee_count, 0),
    avgModulesPerBusiness: businesses.length > 0 
      ? Math.round(businesses.reduce((sum, b) => sum + b.modules.filter(m => m.is_enabled).length, 0) / businesses.length)
      : 0
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
            דשבורד סופר אדמין
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">מרכז שליטה על כל העסקים במערכת</p>
          <p className="text-xs sm:text-sm text-gray-500">מחובר כ: {profile?.email}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => navigate('/admin/new-business')} 
            className="flex items-center gap-2 text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            עסק חדש (מהיר)
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/businesses/create')} 
            className="flex items-center gap-2 text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            עסק חדש (מתקדם)
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Building className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="mr-3 sm:mr-4">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalStats.totalBusinesses}</p>
                <p className="text-gray-600 text-xs sm:text-sm">סך הכל עסקים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="mr-3 sm:mr-4">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalStats.activeBusinesses}</p>
                <p className="text-gray-600 text-xs sm:text-sm">עסקים פעילים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="mr-3 sm:mr-4">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalStats.totalEmployees}</p>
                <p className="text-gray-600 text-xs sm:text-sm">סך הכל עובדים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="mr-3 sm:mr-4">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalStats.avgModulesPerBusiness}</p>
                <p className="text-gray-600 text-xs sm:text-sm">ממוצע מודולים לעסק</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש לפי שם עסק או כתובת מייל..."
                className="pr-10"
              />
            </div>
            <div className="hidden sm:flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                כרטיסים
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                טבלה
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Businesses Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>רשימת עסקים ({filtered.length})</span>
            <div className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'cards' || window.innerWidth < 768 ? (
            // Cards View (Mobile and when selected)
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((business) => (
                <Card key={business.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-1">
                          {business.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="truncate">📧 {business.contact_email || 'לא צוין'}</p>
                          <p>👥 {business.employee_count} עובדים</p>
                        </div>
                      </div>
                      <Badge variant={business.is_active ? 'default' : 'secondary'} className="text-xs">
                        {business.is_active ? 'פעיל' : 'לא פעיל'}
                      </Badge>
                    </div>

                    {/* Modules - Compact View */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {moduleKeys.slice(0, 3).map((moduleKey) => {
                          const moduleState = business.modules.find(m => m.module_key === moduleKey);
                          const isEnabled = moduleState?.is_enabled || false;
                          
                          return (
                            <div key={moduleKey} className="flex items-center gap-1">
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() => toggleModule(business.id, moduleKey, isEnabled)}
                                className="scale-75"
                              />
                              <span className="text-xs truncate max-w-16" title={moduleKey}>
                                {moduleKey.split('_')[0]}
                              </span>
                            </div>
                          );
                        })}
                        {moduleKeys.length > 3 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {moduleKeys.slice(3).map((moduleKey) => {
                                const moduleState = business.modules.find(m => m.module_key === moduleKey);
                                const isEnabled = moduleState?.is_enabled || false;
                                
                                return (
                                  <DropdownMenuItem key={moduleKey} className="flex items-center gap-2">
                                    <Switch
                                      checked={isEnabled}
                                      onCheckedChange={() => toggleModule(business.id, moduleKey, isEnabled)}
                                      className="scale-75"
                                    />
                                    <span className="text-xs">{moduleKey}</span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/business/${business.id}/modules/settings`)}
                        className="flex-1 text-xs"
                      >
                        נהל עסק
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigate(`/business/${business.id}/modules/settings`)}
                        className="px-2"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Table View (Desktop only)
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3">שם עסק</th>
                    <th className="text-right p-3">מייל ליצירת קשר</th>
                    <th className="text-right p-3">עובדים</th>
                    <th className="text-right p-3">סטטוס</th>
                    <th className="text-right p-3">מודולים פעילים</th>
                    <th className="text-right p-3">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((business) => (
                    <tr key={business.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{business.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {business.contact_email || 'לא צוין'}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{business.employee_count}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={business.is_active ? 'default' : 'secondary'}>
                          {business.is_active ? 'פעיל' : 'לא פעיל'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2 max-w-xs">
                          {moduleKeys.map((moduleKey) => {
                            const moduleState = business.modules.find(m => m.module_key === moduleKey);
                            const isEnabled = moduleState?.is_enabled || false;
                            
                            return (
                              <div key={moduleKey} className="flex items-center gap-1">
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={() => toggleModule(business.id, moduleKey, isEnabled)}
                                />
                                <span className="text-xs truncate max-w-20" title={moduleKey}>
                                  {moduleKey.replace('_', ' ')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/business/${business.id}/modules/settings`)}
                          >
                            נהל עסק
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/business/${business.id}/modules/settings`)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצאו עסקים</h3>
                  <p className="text-gray-600">נסה לשנות את החיפוש או צור עסק חדש</p>
                </div>
              )}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצאו עסקים</h3>
              <p className="text-gray-600">נסה לשנות את החיפוש או צור עסק חדש</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
