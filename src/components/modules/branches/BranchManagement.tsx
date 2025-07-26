
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, MapPin, Users, Settings, Plus, Edit, Archive } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BranchDialog } from './BranchDialog';
import { BranchRoles } from './BranchRoles';
import { BranchArchiveButton } from './BranchArchiveButton';
import { GenericArchivedList } from '@/components/shared/GenericArchivedList';
import type { Branch } from '../shifts/schedule/types';

export const BranchManagement: React.FC = () => {
  const navigate = useNavigate();
  const [editBranchOpen, setEditBranchOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const { data: branches, refetch } = useQuery({
    queryKey: ['branches-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          employees:employees(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleEditBranch = (branch: any) => {
    const normalizedBranch: Branch = {
      id: branch.id,
      name: branch.name,
      address: branch.address,
      business_id: branch.business_id,
      latitude: branch.latitude,
      longitude: branch.longitude,
      gps_radius: branch.gps_radius,
      is_active: branch.is_active,
    };
    
    setSelectedBranch(normalizedBranch);
    setEditBranchOpen(true);
  };

  const handleViewEmployees = (branchId: string, branchName: string) => {
    // Navigate to employees page with branch filter
    navigate(`/modules/employees?branch=${branchId}&branchName=${encodeURIComponent(branchName)}`);
  };

  const handleCreateBranch = () => {
    setSelectedBranch(null);
    setEditBranchOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
    setSelectedBranch(null);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" dir="rtl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">ניהול סניפים ותפקידים</h1>
        <p className="text-gray-600 text-sm sm:text-base">ניהול סניפים, עובדים ותפקידים של העסק</p>
      </div>

      <Tabs defaultValue="branches" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-full sm:max-w-lg mb-4 sm:mb-6">
          <TabsTrigger value="branches" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Building className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">סניפים</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">תפקידים</span>
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">ארכיון</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-6">
          {/* Add Branch Button */}
          <div className="mb-4 sm:mb-6">
            <Button onClick={handleCreateBranch} className="w-full sm:w-auto flex items-center gap-2">
              <Plus className="h-4 w-4" />
              הוסף סניף חדש
            </Button>
          </div>

          {/* Branches Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {branches?.map((branch) => (
              <Card key={branch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-6 w-6 text-blue-600" />
                      <Badge variant={branch.is_active ? "default" : "secondary"}>
                        {branch.is_active ? 'פעיל' : 'לא פעיל'}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditBranch(branch)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-2">{branch.name}</h3>
                  
                  {branch.address && (
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <p className="text-sm text-gray-600">{branch.address}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {branch.employees?.[0]?.count || 0} עובדים
                    </span>
                  </div>

                  {branch.gps_radius && (
                    <div className="mb-4 p-2 bg-blue-50 rounded-md">
                      <p className="text-xs text-blue-800">
                        רדיוס GPS: {branch.gps_radius} מטר
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditBranch(branch)}
                    >
                      <Edit className="h-4 w-4 ml-1" />
                      ערוך
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewEmployees(branch.id, branch.name)}
                    >
                      צפה בעובדים
                    </Button>
                    <BranchArchiveButton 
                      branch={branch}
                      onSuccess={refetch}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {branches?.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין סניפים</h3>
              <p className="text-gray-600 mb-4">התחל על ידי הוספת הסניף הראשון</p>
              <Button onClick={handleCreateBranch}>
                <Plus className="h-4 w-4 ml-2" />
                הוסף סניף ראשון
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="roles">
          <BranchRoles />
        </TabsContent>

        <TabsContent value="archive">
          <GenericArchivedList
            tableName="branches"
            entityName="סניף"
            entityNamePlural="סניפים"
            queryKey={['branches-archived']}
            getEntityDisplayName={(branch) => branch.name}
            renderEntityCard={(branch) => (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{branch.name}</span>
                </div>
                {branch.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{branch.address}</span>
                  </div>
                )}
              </div>
            )}
          />
        </TabsContent>
      </Tabs>

      <BranchDialog
        isOpen={editBranchOpen}
        onClose={() => setEditBranchOpen(false)}
        onSuccess={handleEditSuccess}
        branch={selectedBranch}
      />
    </div>
  );
};
