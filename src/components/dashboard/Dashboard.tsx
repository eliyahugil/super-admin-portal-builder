import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users, Shield } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BusinessCard } from './BusinessCard';
import { useToast } from '@/hooks/use-toast';

interface Business {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
}

interface Stats {
  totalBusinesses: number;
  activeBusinesses: number;
  totalUsers: number;
}

export const Dashboard: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState<Stats>({ totalBusinesses: 0, activeBusinesses: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching businesses:', error);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לטעון את העסקים',
          variant: 'destructive',
        });
        return;
      }

      setBusinesses(data || []);
    } catch (error) {
      console.error('Error in fetchBusinesses:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch business stats
      const { count: totalBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

      const { count: activeBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch user stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalBusinesses: totalBusinesses || 0,
        activeBusinesses: activeBusinesses || 0,
        totalUsers: totalUsers || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBusinesses(), fetchStats()]);
      setLoading(false);
    };

    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

  const handleManageBusiness = (businessId: string) => {
    // Navigate to business-specific settings
    navigate(`/business/${businessId}/modules/settings`);
  };

  const handleEditBusiness = (business: Business) => {
    // Navigate to business-specific profile settings
    navigate(`/business/${business.id}/modules/settings/profile`);
  };

  const handleCreateBusiness = () => {
    // Navigate to create business page
    navigate('/admin/businesses/create');
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">אין הרשאה</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              אין לך הרשאות לגשת לפורטל Super Admin
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סך הכל עסקים</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">עסקים פעילים</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeBusinesses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סך הכל משתמשים</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">ניהול עסקים</h2>
          <Button onClick={handleCreateBusiness} className="flex items-center space-x-2 space-x-reverse">
            <Plus className="h-4 w-4" />
            <span>צור עסק חדש</span>
          </Button>
        </div>

        {/* Businesses Grid */}
        {businesses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין עסקים</h3>
              <p className="text-gray-600 mb-4">התחל על ידי יצירת העסק הראשון שלך</p>
              <Button onClick={handleCreateBusiness}>צור עסק חדש</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onManage={handleManageBusiness}
                onEdit={handleEditBusiness}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
